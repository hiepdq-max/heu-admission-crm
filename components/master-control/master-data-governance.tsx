import {
  AlertTriangle,
  CheckCircle2,
  Database,
  FilePenLine,
  GitPullRequestArrow,
  Save,
  ShieldCheck,
  SquarePlus,
} from "lucide-react";

import {
  createMasterDataChangeRequestAction,
  createMasterDataGovernanceAction,
  updateMasterDataChangeRequestAction,
  updateMasterDataGovernanceAction,
} from "@/app/master-control/actions";
import { Button } from "@/components/ui/button";

export type MasterDataGovernanceRow = {
  id: string;
  master_code: string;
  master_name: string;
  module_code: string;
  module_name: string | null;
  source_table: string;
  data_domain: string;
  owner_department: string;
  steward_role: string | null;
  approval_required: boolean;
  checker_role: string | null;
  approver_role: string | null;
  sensitivity_level: string;
  change_frequency: string;
  ai_allowed: boolean;
  duplicate_rule: string | null;
  effective_date_required: boolean;
  audit_required: boolean;
  evidence_required: boolean;
  scope_rule: string | null;
  control_note: string | null;
  control_status: string;
  created_by: string | null;
  created_by_name: string | null;
  updated_by: string | null;
  updated_by_name: string | null;
  created_at: string;
  updated_at: string;
  open_request_count: number;
  approved_request_count: number;
  needs_fix_request_count: number;
  control_flags: string[] | null;
  governance_status: string;
};

export type MasterDataChangeRequestRow = {
  id: string;
  request_code: string;
  governance_id: string;
  master_code: string;
  master_name: string;
  source_table: string;
  change_type: string;
  target_record_id: string | null;
  target_record_code: string | null;
  change_title: string;
  current_value: unknown;
  proposed_value: unknown;
  request_reason: string | null;
  evidence_url: string | null;
  request_status: string;
  requested_by: string | null;
  requested_by_name: string | null;
  checked_by: string | null;
  checked_by_name: string | null;
  checked_at: string | null;
  approved_by: string | null;
  approved_by_name: string | null;
  approved_at: string | null;
  applied_by: string | null;
  applied_by_name: string | null;
  applied_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  request_flags: string[] | null;
  request_control_status: string;
};

export type MasterDataGovernanceSummaryRow = {
  master_count: number;
  ready_count: number;
  temp_ready_count: number;
  needs_evidence_count: number;
  needs_fix_count: number;
  blocked_count: number;
  ai_allowed_count: number;
  open_request_count: number;
};

export type MasterDataModuleOptionRow = {
  module_code: string;
  module_name: string;
};

type MasterDataGovernanceProps = {
  rows: MasterDataGovernanceRow[];
  requests: MasterDataChangeRequestRow[];
  summary?: MasterDataGovernanceSummaryRow | null;
  moduleOptions: MasterDataModuleOptionRow[];
  canManage: boolean;
  canCheck: boolean;
  canApprove: boolean;
  loadError?: string;
};

const inputClass =
  "h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-zinc-500 focus:ring-3 focus:ring-zinc-200";

const textareaClass =
  "min-h-24 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-500 focus:ring-3 focus:ring-zinc-200";

const domains = [
  "IDENTITY",
  "ADMISSION",
  "ACADEMIC",
  "HOU",
  "FINANCE",
  "PARTNER",
  "DOCUMENT",
  "WORKFLOW",
  "AI",
  "OPERATION",
  "OTHER",
];

const domainLabels: Record<string, string> = {
  IDENTITY: "Người dùng / vai trò",
  ADMISSION: "Tuyển sinh",
  ACADEMIC: "Đào tạo",
  HOU: "Liên thông HOU",
  FINANCE: "Tài chính",
  PARTNER: "Đối tác / CTV",
  DOCUMENT: "Hồ sơ / giấy tờ",
  WORKFLOW: "Quy trình",
  AI: "AI",
  OPERATION: "Vận hành",
  OTHER: "Khác",
};

const sensitivityLevels = [
  "PUBLIC",
  "INTERNAL",
  "CONFIDENTIAL",
  "RESTRICTED",
  "SECRET",
];

const sensitivityLabels: Record<string, string> = {
  PUBLIC: "Công khai",
  INTERNAL: "Nội bộ",
  CONFIDENTIAL: "Bảo mật",
  RESTRICTED: "Giới hạn người xem",
  SECRET: "Tối mật",
};

const changeFrequencies = ["RARE", "TERM", "MONTHLY", "WEEKLY", "DAILY", "ON_DEMAND"];

const frequencyLabels: Record<string, string> = {
  RARE: "Rất ít thay đổi",
  TERM: "Theo kỳ",
  MONTHLY: "Theo tháng",
  WEEKLY: "Theo tuần",
  DAILY: "Hàng ngày",
  ON_DEMAND: "Khi có yêu cầu",
};

const controlStatuses = ["DAT", "DAT_TAM_THOI", "CAN_SUA", "CHUA_DU_DIEU_KIEN"];

const controlStatusLabels: Record<string, string> = {
  DAT: "Đạt",
  DAT_TAM_THOI: "Đạt tạm thời",
  CAN_SUA: "Cần sửa",
  CHUA_DU_DIEU_KIEN: "Chưa đủ điều kiện",
};

const governanceLabels: Record<string, string> = {
  READY: "Đã kiểm soát",
  TEMP_READY: "Tạm dùng",
  NEEDS_EVIDENCE: "Thiếu minh chứng",
  NEEDS_FIX: "Cần sửa",
  BLOCKED: "Bị chặn",
};

const governanceTones: Record<string, string> = {
  READY: "border-emerald-200 bg-emerald-50 text-emerald-700",
  TEMP_READY: "border-sky-200 bg-sky-50 text-sky-700",
  NEEDS_EVIDENCE: "border-amber-200 bg-amber-50 text-amber-800",
  NEEDS_FIX: "border-orange-200 bg-orange-50 text-orange-800",
  BLOCKED: "border-rose-200 bg-rose-50 text-rose-700",
};

const requestStatusLabels: Record<string, string> = {
  DRAFT: "Bản nháp",
  PENDING_CHECK: "Chờ kiểm",
  CHECKED: "Đã kiểm",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
  NEEDS_FIX: "Cần bổ sung",
  APPLIED: "Đã áp dụng",
  CANCELLED: "Đã hủy",
};

const changeTypeLabels: Record<string, string> = {
  CREATE: "Tạo mới",
  UPDATE: "Cập nhật",
  DEACTIVATE: "Ngưng dùng",
  MERGE: "Gộp trùng",
  IMPORT: "Import",
  OTHER: "Khác",
};

const flagLabels: Record<string, string> = {
  MISSING_OWNER: "Thiếu owner",
  MISSING_APPROVER: "Thiếu người duyệt",
  NO_AUDIT: "Chưa bật audit",
  MISSING_CHECKED_EVIDENCE: "Thiếu minh chứng đã kiểm",
  AI_ON_SENSITIVE_DATA: "AI bật trên dữ liệu nhạy cảm",
  CONTROL_NOT_READY: "Kiểm soát chưa đạt",
  NOT_SUBMITTED: "Chưa gửi kiểm",
  MISSING_EVIDENCE_URL: "Thiếu link minh chứng",
  NEEDS_FIX: "Cần bổ sung",
  REJECTED: "Đã từ chối",
  WAITING_APPLY: "Chờ áp dụng",
};

function formatNumber(value: number | null | undefined) {
  return new Intl.NumberFormat("vi-VN").format(value ?? 0);
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

function Metric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Database;
}) {
  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-md bg-zinc-100">
          <Icon className="size-5 text-zinc-600" />
        </div>
        <div>
          <p className="text-2xl font-semibold">{formatNumber(value)}</p>
          <p className="text-sm text-zinc-500">{label}</p>
        </div>
      </div>
    </article>
  );
}

function Flags({ flags }: { flags: string[] | null }) {
  if (!flags || flags.length === 0) {
    return (
      <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
        Không cảnh báo
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {flags.map((flag) => (
        <span
          key={flag}
          className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800"
        >
          {flagLabels[flag] ?? flag}
        </span>
      ))}
    </div>
  );
}

function CheckboxField({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-700">
      <input name={name} type="checkbox" defaultChecked={defaultChecked} />
      {label}
    </label>
  );
}

export function MasterDataGovernance({
  rows,
  requests,
  summary,
  moduleOptions,
  canManage,
  canCheck,
  canApprove,
  loadError,
}: MasterDataGovernanceProps) {
  if (loadError) {
    return (
      <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-800">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 size-5 shrink-0" />
          <div>
            <h2 className="font-semibold">Chưa có Master Data Governance P0-10</h2>
            <p className="mt-1">
              Hãy chạy file{" "}
              <span className="font-mono">
                database/step49_master_data_governance.sql
              </span>{" "}
              trong Supabase SQL Editor rồi tải lại Master Control. Chi tiết:{" "}
              {loadError}
            </p>
          </div>
        </div>
      </section>
    );
  }

  const effectiveSummary = summary ?? {
    master_count: rows.length,
    ready_count: rows.filter((row) => row.governance_status === "READY").length,
    temp_ready_count: rows.filter((row) => row.governance_status === "TEMP_READY")
      .length,
    needs_evidence_count: rows.filter(
      (row) => row.governance_status === "NEEDS_EVIDENCE",
    ).length,
    needs_fix_count: rows.filter((row) => row.governance_status === "NEEDS_FIX")
      .length,
    blocked_count: rows.filter((row) => row.governance_status === "BLOCKED")
      .length,
    ai_allowed_count: rows.filter((row) => row.ai_allowed).length,
    open_request_count: requests.filter((request) =>
      ["DRAFT", "PENDING_CHECK", "CHECKED", "NEEDS_FIX"].includes(
        request.request_status,
      ),
    ).length,
  };

  return (
    <section className="space-y-5">
      <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Database className="size-5 text-zinc-600" />
              <h2 className="text-lg font-semibold">
                Master Data Governance P0-10
              </h2>
            </div>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-zinc-500">
              Nơi kiểm soát dữ liệu gốc dùng chung toàn hệ thống: đối tượng
              tuyển sinh, chương trình, ngành, địa điểm học, đối tác, checklist,
              COM, vai trò và các danh mục nền. Mỗi thay đổi quan trọng phải có
              owner, rule, người kiểm, người duyệt và minh chứng nếu bắt buộc.
            </p>
          </div>
          <span className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-600">
            Một nguồn dữ liệu gốc · Có owner · Có request · Có audit
          </span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Metric
          label="Dữ liệu gốc"
          value={effectiveSummary.master_count}
          icon={Database}
        />
        <Metric
          label="Đã kiểm soát"
          value={effectiveSummary.ready_count}
          icon={CheckCircle2}
        />
        <Metric
          label="Thiếu minh chứng"
          value={effectiveSummary.needs_evidence_count}
          icon={AlertTriangle}
        />
        <Metric
          label="Bị chặn"
          value={effectiveSummary.blocked_count}
          icon={ShieldCheck}
        />
        <Metric
          label="Request mở"
          value={effectiveSummary.open_request_count}
          icon={GitPullRequestArrow}
        />
      </div>

      {canManage ? (
        <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 p-5">
            <h3 className="text-base font-semibold">
              Đăng ký dữ liệu gốc cần quản trị
            </h3>
            <p className="mt-1 text-sm text-zinc-500">
              Chỉ đăng ký danh mục dùng chung hoặc có rủi ro vận hành/pháp
              chế/tài chính. Các module nghiệp vụ sẽ dùng danh mục này thay vì
              tự tạo danh mục riêng.
            </p>
          </div>
          <form
            action={createMasterDataGovernanceAction}
            className="grid gap-4 p-5 lg:grid-cols-4"
          >
            <input
              name="master_code"
              className={inputClass}
              placeholder="Mã dữ liệu gốc"
              required
            />
            <input
              name="master_name"
              className={inputClass}
              placeholder="Tên dữ liệu gốc"
              required
            />
            <select name="module_code" className={inputClass} required>
              {moduleOptions.map((module) => (
                <option key={module.module_code} value={module.module_code}>
                  {module.module_code} - {module.module_name}
                </option>
              ))}
            </select>
            <input
              name="source_table"
              className={inputClass}
              placeholder="Tên bảng gốc, ví dụ admission_segments"
              required
            />
            <select name="data_domain" className={inputClass} defaultValue="OPERATION">
              {domains.map((domain) => (
                <option key={domain} value={domain}>
                  {domainLabels[domain] ?? domain}
                </option>
              ))}
            </select>
            <input
              name="owner_department"
              className={inputClass}
              placeholder="Phòng/đơn vị owner"
              required
            />
            <input name="steward_role" className={inputClass} placeholder="Vai trò phụ trách" />
            <input name="checker_role" className={inputClass} placeholder="Vai trò kiểm" />
            <input name="approver_role" className={inputClass} placeholder="Vai trò duyệt" />
            <select
              name="sensitivity_level"
              className={inputClass}
              defaultValue="INTERNAL"
            >
              {sensitivityLevels.map((level) => (
                <option key={level} value={level}>
                  {sensitivityLabels[level] ?? level}
                </option>
              ))}
            </select>
            <select
              name="change_frequency"
              className={inputClass}
              defaultValue="ON_DEMAND"
            >
              {changeFrequencies.map((frequency) => (
                <option key={frequency} value={frequency}>
                  {frequencyLabels[frequency] ?? frequency}
                </option>
              ))}
            </select>
            <select
              name="control_status"
              className={inputClass}
              defaultValue="DAT_TAM_THOI"
            >
              {controlStatuses.map((status) => (
                <option key={status} value={status}>
                  {controlStatusLabels[status] ?? status}
                </option>
              ))}
            </select>
            <div className="grid gap-2 lg:col-span-4 lg:grid-cols-5">
              <CheckboxField name="approval_required" label="Bắt buộc duyệt" defaultChecked />
              <CheckboxField name="audit_required" label="Bắt buộc log" defaultChecked />
              <CheckboxField name="evidence_required" label="Bắt buộc minh chứng" />
              <CheckboxField name="effective_date_required" label="Có ngày hiệu lực" />
              <CheckboxField name="ai_allowed" label="Cho AI đọc" />
            </div>
            <textarea
              name="duplicate_rule"
              className={textareaClass}
              placeholder="Quy tắc chống trùng/sai dữ liệu"
            />
            <textarea
              name="scope_rule"
              className={textareaClass}
              placeholder="Quy tắc phạm vi ai được thấy/dùng"
            />
            <textarea
              name="control_note"
              className={`${textareaClass} lg:col-span-2`}
              placeholder="Ghi chú kiểm soát"
            />
            <div className="lg:col-span-4">
              <Button type="submit">
                <SquarePlus className="size-4" />
                Đăng ký dữ liệu gốc
              </Button>
            </div>
          </form>
        </section>
      ) : null}

      <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-200 p-5">
          <h3 className="text-base font-semibold">Bảng kiểm dữ liệu gốc</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Dữ liệu gốc đạt khi có owner, người duyệt nếu bắt buộc, audit, rule
            chống trùng và minh chứng đã kiểm nếu yêu cầu.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1280px] text-sm">
            <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
              <tr>
                <th className="px-5 py-3">Dữ liệu gốc</th>
                <th className="px-5 py-3">Owner / phạm vi</th>
                <th className="px-5 py-3">Rule</th>
                <th className="px-5 py-3">Kiểm soát</th>
                <th className="px-5 py-3">Cảnh báo</th>
                {canManage ? <th className="px-5 py-3">Cập nhật</th> : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {rows.length === 0 ? (
                <tr>
                  <td
                    className="px-5 py-8 text-center text-zinc-500"
                    colSpan={canManage ? 6 : 5}
                  >
                    Chưa có dữ liệu gốc nào được đăng ký quản trị.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="align-top">
                    <td className="px-5 py-4">
                      <p className="font-mono text-xs text-zinc-500">
                        {row.master_code}
                      </p>
                      <p className="mt-1 font-medium text-zinc-950">
                        {row.master_name}
                      </p>
                      <p className="mt-2 text-xs text-zinc-500">
                        {row.source_table} · {domainLabels[row.data_domain] ?? row.data_domain}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-zinc-700">
                        {row.owner_department}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {row.module_code} · {row.steward_role ?? "Chưa có steward"}
                      </p>
                      <p className="mt-2 line-clamp-3 text-xs leading-5 text-zinc-500">
                        {row.scope_rule ?? "Chưa ghi rule phạm vi"}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-xs text-zinc-500">
                        Bảo mật:{" "}
                        {sensitivityLabels[row.sensitivity_level] ??
                          row.sensitivity_level}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        Đổi:{" "}
                        {frequencyLabels[row.change_frequency] ??
                          row.change_frequency}
                      </p>
                      <p className="mt-2 line-clamp-3 text-xs leading-5 text-zinc-500">
                        {row.duplicate_rule ?? "Chưa ghi rule chống trùng"}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${
                          governanceTones[row.governance_status] ??
                          "border-zinc-200 bg-zinc-50 text-zinc-700"
                        }`}
                      >
                        {governanceLabels[row.governance_status] ??
                          row.governance_status}
                      </span>
                      <div className="mt-2 space-y-1 text-xs text-zinc-500">
                        <p>
                          Duyệt: {row.approval_required ? "Bắt buộc" : "Không bắt buộc"}
                        </p>
                        <p>Audit: {row.audit_required ? "Có" : "Không"}</p>
                        <p>AI: {row.ai_allowed ? "Được đọc" : "Không được đọc"}</p>
                        <p>Request mở: {formatNumber(row.open_request_count)}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <Flags flags={row.control_flags} />
                      {row.control_note ? (
                        <p className="mt-2 line-clamp-3 text-xs leading-5 text-zinc-500">
                          {row.control_note}
                        </p>
                      ) : null}
                    </td>
                    {canManage ? (
                      <td className="px-5 py-4">
                        <form
                          action={updateMasterDataGovernanceAction}
                          className="grid min-w-96 gap-2"
                        >
                          <input type="hidden" name="governance_id" value={row.id} />
                          <input
                            name="master_name"
                            className={inputClass}
                            defaultValue={row.master_name}
                          />
                          <input
                            name="module_code"
                            className={inputClass}
                            defaultValue={row.module_code}
                          />
                          <input
                            name="source_table"
                            className={inputClass}
                            defaultValue={row.source_table}
                          />
                          <input
                            name="owner_department"
                            className={inputClass}
                            defaultValue={row.owner_department}
                          />
                          <select
                            name="data_domain"
                            className={inputClass}
                            defaultValue={row.data_domain}
                          >
                            {domains.map((domain) => (
                              <option key={domain} value={domain}>
                                {domainLabels[domain] ?? domain}
                              </option>
                            ))}
                          </select>
                          <div className="grid gap-2 sm:grid-cols-2">
                            <input
                              name="steward_role"
                              className={inputClass}
                              defaultValue={row.steward_role ?? ""}
                              placeholder="Steward"
                            />
                            <input
                              name="checker_role"
                              className={inputClass}
                              defaultValue={row.checker_role ?? ""}
                              placeholder="Người kiểm"
                            />
                            <input
                              name="approver_role"
                              className={inputClass}
                              defaultValue={row.approver_role ?? ""}
                              placeholder="Người duyệt"
                            />
                            <select
                              name="control_status"
                              className={inputClass}
                              defaultValue={row.control_status}
                            >
                              {controlStatuses.map((status) => (
                                <option key={status} value={status}>
                                  {controlStatusLabels[status] ?? status}
                                </option>
                              ))}
                            </select>
                            <select
                              name="sensitivity_level"
                              className={inputClass}
                              defaultValue={row.sensitivity_level}
                            >
                              {sensitivityLevels.map((level) => (
                                <option key={level} value={level}>
                                  {sensitivityLabels[level] ?? level}
                                </option>
                              ))}
                            </select>
                            <select
                              name="change_frequency"
                              className={inputClass}
                              defaultValue={row.change_frequency}
                            >
                              {changeFrequencies.map((frequency) => (
                                <option key={frequency} value={frequency}>
                                  {frequencyLabels[frequency] ?? frequency}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="grid gap-2 sm:grid-cols-2">
                            <CheckboxField
                              name="approval_required"
                              label="Bắt buộc duyệt"
                              defaultChecked={row.approval_required}
                            />
                            <CheckboxField
                              name="audit_required"
                              label="Bắt buộc log"
                              defaultChecked={row.audit_required}
                            />
                            <CheckboxField
                              name="evidence_required"
                              label="Bắt buộc minh chứng"
                              defaultChecked={row.evidence_required}
                            />
                            <CheckboxField
                              name="effective_date_required"
                              label="Có ngày hiệu lực"
                              defaultChecked={row.effective_date_required}
                            />
                            <CheckboxField
                              name="ai_allowed"
                              label="Cho AI đọc"
                              defaultChecked={row.ai_allowed}
                            />
                          </div>
                          <textarea
                            name="duplicate_rule"
                            className={textareaClass}
                            defaultValue={row.duplicate_rule ?? ""}
                            placeholder="Rule chống trùng"
                          />
                          <textarea
                            name="scope_rule"
                            className={textareaClass}
                            defaultValue={row.scope_rule ?? ""}
                            placeholder="Rule phạm vi"
                          />
                          <textarea
                            name="control_note"
                            className={textareaClass}
                            defaultValue={row.control_note ?? ""}
                            placeholder="Ghi chú kiểm soát"
                          />
                          <Button type="submit" size="sm">
                            <Save className="size-4" />
                            Lưu governance
                          </Button>
                        </form>
                      </td>
                    ) : null}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-lg border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 p-5">
            <h3 className="text-base font-semibold">
              Tạo yêu cầu thay đổi dữ liệu gốc
            </h3>
            <p className="mt-1 text-sm text-zinc-500">
              Dùng khi cần thêm/sửa/ngưng dùng/gộp/import danh mục gốc. Phần này
              tạo yêu cầu, chưa tự sửa bảng nghiệp vụ.
            </p>
          </div>
          <form action={createMasterDataChangeRequestAction} className="grid gap-4 p-5">
            <select name="governance_id" className={inputClass} required>
              {rows.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.master_code} - {row.master_name}
                </option>
              ))}
            </select>
            <select name="master_code" className={inputClass} required>
              {rows.map((row) => (
                <option key={row.id} value={row.master_code}>
                  {row.master_code}
                </option>
              ))}
            </select>
            <select name="change_type" className={inputClass} defaultValue="UPDATE">
              {Object.entries(changeTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <input
              name="change_title"
              className={inputClass}
              placeholder="Tiêu đề yêu cầu thay đổi"
              required
            />
            <input
              name="target_record_code"
              className={inputClass}
              placeholder="Mã bản ghi cần sửa nếu có"
            />
            <input
              name="target_record_id"
              className={inputClass}
              placeholder="UUID bản ghi nếu có"
            />
            <input
              name="evidence_url"
              className={inputClass}
              placeholder="Link minh chứng nếu có"
            />
            <select
              name="request_status"
              className={inputClass}
              defaultValue="PENDING_CHECK"
            >
              <option value="PENDING_CHECK">Gửi kiểm</option>
              <option value="DRAFT">Bản nháp</option>
            </select>
            <textarea
              name="request_reason"
              className={textareaClass}
              placeholder="Lý do thay đổi"
            />
            <textarea
              name="current_value"
              className={textareaClass}
              placeholder='Giá trị hiện tại dạng JSON, ví dụ {"name":"cũ"}'
            />
            <textarea
              name="proposed_value"
              className={textareaClass}
              placeholder='Giá trị đề xuất dạng JSON, ví dụ {"name":"mới"}'
            />
            <Button type="submit" disabled={rows.length === 0}>
              <FilePenLine className="size-4" />
              Tạo request thay đổi
            </Button>
          </form>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 p-5">
            <h3 className="text-base font-semibold">
              Request thay đổi dữ liệu gốc gần đây
            </h3>
            <p className="mt-1 text-sm text-zinc-500">
              Request phải được kiểm/duyệt trước khi quản trị viên áp dụng vào
              bảng dữ liệu gốc thật.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
                <tr>
                  <th className="px-5 py-3">Request</th>
                  <th className="px-5 py-3">Thay đổi</th>
                  <th className="px-5 py-3">Kiểm soát</th>
                  <th className="px-5 py-3">Cập nhật</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {requests.length === 0 ? (
                  <tr>
                    <td className="px-5 py-8 text-center text-zinc-500" colSpan={4}>
                      Chưa có request thay đổi dữ liệu gốc.
                    </td>
                  </tr>
                ) : (
                  requests.map((request) => (
                    <tr key={request.id} className="align-top">
                      <td className="px-5 py-4">
                        <p className="font-mono text-xs text-zinc-500">
                          {request.request_code}
                        </p>
                        <p className="mt-1 font-medium text-zinc-950">
                          {request.change_title}
                        </p>
                        <p className="mt-2 text-xs text-zinc-500">
                          {request.master_code} · tạo {formatDateTime(request.created_at)}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-zinc-700">
                          {changeTypeLabels[request.change_type] ??
                            request.change_type}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                          Bản ghi: {request.target_record_code ?? "Chưa ghi"}
                        </p>
                        <p className="mt-2 line-clamp-3 text-xs leading-5 text-zinc-500">
                          {request.request_reason ?? "Chưa ghi lý do"}
                        </p>
                        {request.evidence_url ? (
                          <a
                            href={request.evidence_url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-flex text-xs text-zinc-900 underline"
                          >
                            Mở minh chứng
                          </a>
                        ) : null}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${
                            request.request_control_status === "DONE"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : request.request_control_status === "BLOCKED"
                                ? "border-rose-200 bg-rose-50 text-rose-700"
                                : request.request_control_status === "NEEDS_FIX"
                                  ? "border-amber-200 bg-amber-50 text-amber-800"
                                  : "border-sky-200 bg-sky-50 text-sky-700"
                          }`}
                        >
                          {requestStatusLabels[request.request_status] ??
                            request.request_status}
                        </span>
                        <div className="mt-2">
                          <Flags flags={request.request_flags} />
                        </div>
                        <div className="mt-2 space-y-1 text-xs text-zinc-500">
                          <p>Người tạo: {request.requested_by_name ?? "Chưa rõ"}</p>
                          <p>Kiểm: {request.checked_by_name ?? "Chưa kiểm"}</p>
                          <p>Duyệt: {request.approved_by_name ?? "Chưa duyệt"}</p>
                          <p>Áp dụng: {formatDateTime(request.applied_at)}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {canCheck || canApprove || canManage ? (
                          <form
                            action={updateMasterDataChangeRequestAction}
                            className="grid min-w-80 gap-2"
                          >
                            <input type="hidden" name="request_id" value={request.id} />
                            <select
                              name="request_status"
                              className={inputClass}
                              defaultValue={request.request_status}
                            >
                              {canCheck ? (
                                <>
                                  <option value="CHECKED">Đã kiểm</option>
                                  <option value="NEEDS_FIX">Cần bổ sung</option>
                                  <option value="PENDING_CHECK">Chờ kiểm</option>
                                </>
                              ) : null}
                              {canApprove ? (
                                <>
                                  <option value="APPROVED">Duyệt</option>
                                  <option value="REJECTED">Từ chối</option>
                                </>
                              ) : null}
                              {canManage ? (
                                <option value="APPLIED">Đã áp dụng vào dữ liệu thật</option>
                              ) : null}
                              <option value="CANCELLED">Hủy</option>
                            </select>
                            <input
                              name="evidence_url"
                              className={inputClass}
                              defaultValue={request.evidence_url ?? ""}
                              placeholder="Link minh chứng"
                            />
                            <textarea
                              name="rejection_reason"
                              className={textareaClass}
                              defaultValue={request.rejection_reason ?? ""}
                              placeholder="Lý do từ chối/cần bổ sung"
                            />
                            <Button type="submit" size="sm">
                              <Save className="size-4" />
                              Lưu request
                            </Button>
                          </form>
                        ) : (
                          <span className="text-xs text-zinc-500">
                            Chưa có quyền xử lý
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </section>
  );
}
