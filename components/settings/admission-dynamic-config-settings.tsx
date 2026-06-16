import {
  AlertTriangle,
  BookOpenCheck,
  Save,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  SquarePlus,
} from "lucide-react";

import {
  createAdmissionConditionRuleConfigAction,
  createAdmissionFormFieldConfigAction,
  createAdmissionProgramRuleAction,
  updateAdmissionConditionRuleConfigAction,
  updateAdmissionFormFieldConfigAction,
  updateAdmissionProgramRuleAction,
} from "@/app/settings/actions";
import type { AdmissionSegmentRow } from "@/components/settings/admission-segment-settings";
import type {
  AdmissionMajorRow,
  AdmissionProgramRow,
} from "@/components/settings/program-major-settings";
import { Button } from "@/components/ui/button";

export type AdmissionDynamicConfigSummaryRow = {
  segment_count: number;
  ready_count: number;
  needs_fix_count: number;
  blocked_count: number;
  program_rule_count: number;
  visible_field_count: number;
  required_condition_count: number;
};

export type AdmissionDynamicConfigOverviewRow = {
  segment_id: string;
  segment_code: string;
  segment_name: string;
  program_group: string;
  owner_department: string;
  program_rule_count: number;
  program_count: number;
  major_rule_count: number;
  field_count: number;
  visible_field_count: number;
  required_field_count: number;
  condition_count: number;
  required_condition_count: number;
  control_flags: string[] | null;
  config_status: string;
};

export type AdmissionProgramRuleConfigRow = {
  id: string;
  segment_id: string;
  segment_code: string;
  segment_name: string;
  program_group: string;
  program_id: string;
  program_code: string;
  program_name: string;
  major_id: string | null;
  major_code: string | null;
  major_name: string | null;
  is_default: boolean;
  is_required: boolean;
  sort_order: number;
  note: string | null;
  status: string;
};

export type AdmissionFormFieldConfigRow = {
  id: string;
  segment_id: string;
  segment_code: string;
  segment_name: string;
  field_key: string;
  field_label: string;
  field_group: string;
  field_type: string;
  is_visible: boolean;
  is_required: boolean;
  option_source: string;
  placeholder: string | null;
  help_text: string | null;
  validation_rule: string | null;
  sort_order: number;
  status: string;
  control_flags: string[] | null;
  field_status: string;
};

export type AdmissionConditionRuleConfigRow = {
  id: string;
  segment_id: string;
  segment_code: string;
  segment_name: string;
  condition_code: string;
  condition_name: string;
  condition_group: string;
  is_required: boolean;
  blocking_level: string;
  evidence_required: boolean;
  owner_department: string | null;
  checker_role: string | null;
  approver_role: string | null;
  rule_note: string | null;
  sort_order: number;
  status: string;
  control_flags: string[] | null;
  rule_status: string;
};

type AdmissionDynamicConfigSettingsProps = {
  overview: AdmissionDynamicConfigOverviewRow[];
  summary?: AdmissionDynamicConfigSummaryRow | null;
  programRules: AdmissionProgramRuleConfigRow[];
  formFields: AdmissionFormFieldConfigRow[];
  conditionRules: AdmissionConditionRuleConfigRow[];
  segments: AdmissionSegmentRow[];
  programs: AdmissionProgramRow[];
  majors: AdmissionMajorRow[];
  loadError?: string;
};

const inputClass =
  "h-9 w-full rounded-md border border-zinc-300 bg-white px-2 text-sm outline-none transition focus:border-zinc-500 focus:ring-3 focus:ring-zinc-200";

const textareaClass =
  "min-h-20 w-full rounded-md border border-zinc-300 bg-white px-2 py-2 text-sm outline-none transition focus:border-zinc-500 focus:ring-3 focus:ring-zinc-200";

const fieldTypes = [
  ["TEXT", "Chữ ngắn"],
  ["TEXTAREA", "Ghi chú dài"],
  ["PHONE", "Số điện thoại"],
  ["EMAIL", "Email"],
  ["DATE", "Ngày"],
  ["DATETIME", "Ngày giờ"],
  ["SELECT", "Chọn một"],
  ["MULTI_SELECT", "Chọn nhiều"],
  ["NUMBER", "Số"],
  ["MONEY", "Tiền"],
  ["CHECKBOX", "Tích chọn"],
  ["FILE_URL", "Link file/minh chứng"],
  ["PARTNER", "Đối tác/CTV"],
  ["PROGRAM", "Hệ đào tạo"],
  ["MAJOR", "Ngành"],
  ["LOCATION", "Địa điểm"],
  ["HOU_PROGRAM", "Chương trình HOU"],
  ["HOU_MAJOR", "Ngành HOU"],
  ["HOU_LOCATION", "Địa điểm HOU"],
];

const optionSources = [
  ["NONE", "Không cần danh mục"],
  ["STATIC", "Danh sách tự nhập sau"],
  ["LEAD_SOURCE", "Nguồn lead"],
  ["PARTNER", "Đối tác/CTV"],
  ["PROGRAM_BY_SEGMENT", "Hệ theo đối tượng"],
  ["MAJOR_BY_PROGRAM", "Ngành theo hệ"],
  ["HOU_PROGRAM", "Chương trình HOU"],
  ["HOU_MAJOR", "Ngành HOU"],
  ["HOU_LOCATION", "Địa điểm HOU"],
  ["USER", "Người dùng"],
  ["CAMPAIGN", "Chiến dịch"],
];

const conditionGroups = [
  ["ADMISSION", "Tuyển sinh"],
  ["DOCUMENT", "Hồ sơ"],
  ["ENROLLMENT", "Nhập học"],
  ["HANDOVER", "Bàn giao"],
  ["FINANCE", "Tài chính"],
  ["COM", "COM"],
  ["HOU", "HOU"],
  ["CUSTOM", "Khác"],
];

const blockingLevels = [
  ["INFO", "Chỉ ghi nhận"],
  ["WARN", "Cảnh báo"],
  ["BLOCK", "Bắt buộc, chặn nếu thiếu"],
];

const statusOptions = [
  ["ACTIVE", "Đang dùng"],
  ["INACTIVE", "Tạm dừng"],
];

const flagLabels: Record<string, string> = {
  NO_PROGRAM_RULES: "Chưa gắn hệ/ngành",
  NO_VISIBLE_FIELDS: "Chưa có field hiển thị",
  NO_STUDENT_NAME_FIELD: "Thiếu họ tên bắt buộc",
  NO_PHONE_FIELD: "Thiếu số điện thoại bắt buộc",
  NO_REQUIRED_CONDITIONS: "Chưa có điều kiện bắt buộc",
  HOU_MISSING_SYSTEM_CONDITION: "HOU thiếu điều kiện hệ thống",
  TC9_MISSING_DOCUMENT_CONDITION: "9+ thiếu điều kiện hồ sơ",
  MISSING_LABEL: "Thiếu nhãn hiển thị",
  REQUIRED_BUT_HIDDEN: "Bắt buộc nhưng đang ẩn",
  MISSING_OPTION_SOURCE: "Thiếu nguồn lựa chọn",
  CORE_FIELD_NOT_REQUIRED: "Field lõi chưa bắt buộc",
  REQUIRED_NOT_BLOCKING: "Bắt buộc nhưng chưa chặn",
  MISSING_OWNER: "Thiếu phòng phụ trách",
  MISSING_EVIDENCE_NOTE: "Thiếu mô tả minh chứng",
  BLOCKING_MISSING_APPROVER: "Chặn nhưng thiếu người duyệt",
};

function ProgramSelect({
  programs,
  form,
  defaultValue,
}: {
  programs: AdmissionProgramRow[];
  form?: string;
  defaultValue?: string | null;
}) {
  return (
    <select
      form={form}
      name="program_id"
      className={inputClass}
      defaultValue={defaultValue ?? ""}
      required
    >
      <option value="">Chọn hệ đào tạo</option>
      {programs.map((program) => (
        <option key={program.id} value={program.id}>
          {program.program_name}
        </option>
      ))}
    </select>
  );
}

function MajorSelect({
  majors,
  programs,
  form,
  defaultValue,
}: {
  majors: AdmissionMajorRow[];
  programs: AdmissionProgramRow[];
  form?: string;
  defaultValue?: string | null;
}) {
  const programById = new Map(
    programs.map((program) => [program.id, program.program_name]),
  );

  return (
    <select
      form={form}
      name="major_id"
      className={inputClass}
      defaultValue={defaultValue ?? ""}
    >
      <option value="">Tất cả ngành của hệ</option>
      {majors.map((major) => (
        <option key={major.id} value={major.id}>
          {major.major_name}
          {major.program_id ? ` · ${programById.get(major.program_id) ?? ""}` : ""}
        </option>
      ))}
    </select>
  );
}

function SegmentSelect({
  segments,
  form,
  defaultValue,
}: {
  segments: AdmissionSegmentRow[];
  form?: string;
  defaultValue?: string | null;
}) {
  return (
    <select
      form={form}
      name="segment_id"
      className={inputClass}
      defaultValue={defaultValue ?? ""}
      required
    >
      <option value="">Chọn đối tượng tuyển sinh</option>
      {segments.map((segment) => (
        <option key={segment.id} value={segment.id}>
          {segment.segment_name}
        </option>
      ))}
    </select>
  );
}

function SimpleSelect({
  name,
  options,
  form,
  defaultValue,
}: {
  name: string;
  options: string[][];
  form?: string;
  defaultValue?: string | null;
}) {
  return (
    <select
      form={form}
      name={name}
      className={inputClass}
      defaultValue={defaultValue ?? options[0]?.[0]}
    >
      {options.map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: number | undefined;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
      <p className="text-2xl font-semibold text-zinc-950">{value ?? 0}</p>
      <p className="mt-1 text-xs font-medium uppercase text-zinc-500">{label}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const style =
    status === "READY"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "BLOCKED"
        ? "border-rose-200 bg-rose-50 text-rose-700"
        : status === "NEEDS_FIX"
          ? "border-amber-200 bg-amber-50 text-amber-800"
          : "border-zinc-200 bg-zinc-50 text-zinc-600";

  const label =
    status === "READY"
      ? "Đủ cấu hình"
      : status === "BLOCKED"
        ? "Đang chặn"
        : status === "NEEDS_FIX"
          ? "Cần bổ sung"
          : status === "ACTIVE"
            ? "Đang dùng"
            : status === "INACTIVE"
              ? "Tạm dừng"
              : status;

  return (
    <span className={`rounded-md border px-2 py-1 text-xs font-medium ${style}`}>
      {label}
    </span>
  );
}

function FlagList({ flags }: { flags: string[] | null }) {
  if (!flags || flags.length === 0) {
    return <span className="text-xs text-emerald-700">Không có cảnh báo</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {flags.map((flag) => (
        <span
          key={flag}
          className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-800"
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
  form,
  defaultChecked,
}: {
  name: string;
  label: string;
  form?: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex h-9 items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-700">
      <input
        form={form}
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="size-4 rounded border-zinc-300"
      />
      {label}
    </label>
  );
}

export function AdmissionDynamicConfigSettings({
  overview,
  summary,
  programRules,
  formFields,
  conditionRules,
  segments,
  programs,
  majors,
  loadError,
}: AdmissionDynamicConfigSettingsProps) {
  if (loadError) {
    return (
      <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <p>
            Chưa đọc được P0-17. Hãy chạy file SQL{" "}
            <span className="font-mono">
              database/step56_dynamic_admission_configuration.sql
            </span>{" "}
            trong Supabase SQL Editor rồi tải lại trang. Chi tiết: {loadError}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="dynamic-admission-config"
      className="rounded-lg border border-zinc-200 bg-white shadow-sm"
    >
      <div className="border-b border-zinc-200 p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-zinc-100">
            <Settings2 className="size-5 text-zinc-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold">
              P0-17 · Cấu hình tuyển sinh động
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Chọn đối tượng tuyển sinh trước, sau đó hệ đào tạo, ngành, field
              lead và điều kiện bắt buộc sẽ đi theo đúng cấu hình của đối tượng
              đó.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 border-b border-zinc-200 p-5 md:grid-cols-3 xl:grid-cols-7">
        <Metric label="Đối tượng" value={summary?.segment_count} />
        <Metric label="Đủ cấu hình" value={summary?.ready_count} />
        <Metric label="Cần bổ sung" value={summary?.needs_fix_count} />
        <Metric label="Đang chặn" value={summary?.blocked_count} />
        <Metric label="Rule hệ/ngành" value={summary?.program_rule_count} />
        <Metric label="Field đang hiện" value={summary?.visible_field_count} />
        <Metric label="Điều kiện bắt buộc" value={summary?.required_condition_count} />
      </div>

      <div className="grid gap-5 border-b border-zinc-200 p-5 xl:grid-cols-3">
        <form
          action={createAdmissionProgramRuleAction}
          className="rounded-lg border border-zinc-200 bg-zinc-50 p-4"
        >
          <div className="flex items-center gap-2">
            <BookOpenCheck className="size-4 text-zinc-500" />
            <h3 className="text-sm font-semibold">Gắn hệ/ngành cho đối tượng</h3>
          </div>
          <div className="mt-4 space-y-3">
            <SegmentSelect segments={segments} />
            <ProgramSelect programs={programs} />
            <MajorSelect majors={majors} programs={programs} />
            <input
              name="sort_order"
              type="number"
              className={inputClass}
              defaultValue={10}
              placeholder="Thứ tự"
            />
            <input
              name="note"
              className={inputClass}
              placeholder="Ghi chú rule nếu cần"
            />
            <div className="grid gap-2 sm:grid-cols-2">
              <CheckboxField name="is_default" label="Mặc định" />
              <CheckboxField name="is_required" label="Bắt buộc chọn" />
            </div>
            <SimpleSelect name="status" options={statusOptions} />
            <Button type="submit" size="sm">
              <SquarePlus className="size-4" />
              Thêm rule
            </Button>
          </div>
        </form>

        <form
          action={createAdmissionFormFieldConfigAction}
          className="rounded-lg border border-zinc-200 bg-zinc-50 p-4"
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="size-4 text-zinc-500" />
            <h3 className="text-sm font-semibold">Thêm field cho form lead</h3>
          </div>
          <div className="mt-4 space-y-3">
            <SegmentSelect segments={segments} />
            <input name="field_key" className={inputClass} placeholder="vd: birth_date" required />
            <input name="field_label" className={inputClass} placeholder="Nhãn hiển thị tiếng Việt" required />
            <input name="field_group" className={inputClass} placeholder="LEAD_CORE / HOU / FINANCE" defaultValue="LEAD" />
            <div className="grid gap-2 sm:grid-cols-2">
              <SimpleSelect name="field_type" options={fieldTypes} />
              <SimpleSelect name="option_source" options={optionSources} />
            </div>
            <input name="placeholder" className={inputClass} placeholder="Gợi ý nhập" />
            <input name="help_text" className={inputClass} placeholder="Giải thích ngắn" />
            <div className="grid gap-2 sm:grid-cols-3">
              <input name="sort_order" type="number" className={inputClass} defaultValue={100} />
              <CheckboxField name="is_visible" label="Hiển thị" defaultChecked />
              <CheckboxField name="is_required" label="Bắt buộc" />
            </div>
            <SimpleSelect name="status" options={statusOptions} />
            <Button type="submit" size="sm">
              <SquarePlus className="size-4" />
              Thêm field
            </Button>
          </div>
        </form>

        <form
          action={createAdmissionConditionRuleConfigAction}
          className="rounded-lg border border-zinc-200 bg-zinc-50 p-4"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-zinc-500" />
            <h3 className="text-sm font-semibold">Thêm điều kiện kiểm soát</h3>
          </div>
          <div className="mt-4 space-y-3">
            <SegmentSelect segments={segments} />
            <input name="condition_code" className={inputClass} placeholder="VD: FIRST_TUITION_CONFIRMED" required />
            <input name="condition_name" className={inputClass} placeholder="Tên điều kiện tiếng Việt" required />
            <div className="grid gap-2 sm:grid-cols-2">
              <SimpleSelect name="condition_group" options={conditionGroups} />
              <SimpleSelect name="blocking_level" options={blockingLevels} defaultValue="BLOCK" />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <CheckboxField name="is_required" label="Điều kiện bắt buộc" defaultChecked />
              <CheckboxField name="evidence_required" label="Cần minh chứng" />
            </div>
            <input name="owner_department" className={inputClass} placeholder="Phòng phụ trách" />
            <input name="checker_role" className={inputClass} placeholder="Người kiểm tra" />
            <input name="approver_role" className={inputClass} placeholder="Người duyệt" />
            <textarea name="rule_note" className={textareaClass} placeholder="Mô tả rule, minh chứng cần có, rủi ro cần chặn" />
            <input name="sort_order" type="number" className={inputClass} defaultValue={100} />
            <SimpleSelect name="status" options={statusOptions} />
            <Button type="submit" size="sm">
              <SquarePlus className="size-4" />
              Thêm điều kiện
            </Button>
          </div>
        </form>
      </div>

      <div className="space-y-6 p-5">
        <div className="overflow-x-auto rounded-lg border border-zinc-200">
          <table className="w-full min-w-[1100px] text-sm">
            <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3">Đối tượng</th>
                <th className="px-4 py-3">Hệ/ngành</th>
                <th className="px-4 py-3">Field</th>
                <th className="px-4 py-3">Điều kiện</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Cảnh báo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {overview.map((row) => (
                <tr key={row.segment_id} className="align-top">
                  <td className="px-4 py-4">
                    <p className="font-medium text-zinc-950">{row.segment_name}</p>
                    <p className="mt-1 font-mono text-xs text-zinc-500">{row.segment_code}</p>
                    <p className="mt-1 text-xs text-zinc-500">{row.owner_department}</p>
                  </td>
                  <td className="px-4 py-4">
                    {row.program_count} hệ · {row.major_rule_count} rule ngành
                  </td>
                  <td className="px-4 py-4">
                    {row.visible_field_count}/{row.field_count} field đang hiện
                  </td>
                  <td className="px-4 py-4">
                    {row.required_condition_count}/{row.condition_count} bắt buộc
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={row.config_status} />
                  </td>
                  <td className="px-4 py-4">
                    <FlagList flags={row.control_flags} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="overflow-x-auto rounded-lg border border-zinc-200">
          <table className="w-full min-w-[1200px] text-sm">
            <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3">Rule hệ/ngành</th>
                <th className="px-4 py-3">Đối tượng</th>
                <th className="px-4 py-3">Hệ</th>
                <th className="px-4 py-3">Ngành</th>
                <th className="px-4 py-3">Tùy chọn</th>
                <th className="px-4 py-3">Lưu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {programRules.map((rule) => {
                const formId = `program-rule-${rule.id}`;
                return (
                  <tr key={rule.id} className="align-top">
                    <td className="px-4 py-4">
                      <p className="font-mono text-xs">{rule.program_code}</p>
                      <p className="mt-1 text-xs text-zinc-500">{rule.note ?? "Không ghi chú"}</p>
                    </td>
                    <td className="px-4 py-4">
                      <form id={formId} action={updateAdmissionProgramRuleAction} className="contents">
                        <input type="hidden" name="rule_id" value={rule.id} />
                      </form>
                      <SegmentSelect segments={segments} form={formId} defaultValue={rule.segment_id} />
                    </td>
                    <td className="px-4 py-4">
                      <ProgramSelect programs={programs} form={formId} defaultValue={rule.program_id} />
                    </td>
                    <td className="px-4 py-4">
                      <MajorSelect majors={majors} programs={programs} form={formId} defaultValue={rule.major_id} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="grid gap-2">
                        <input form={formId} name="sort_order" type="number" className={inputClass} defaultValue={rule.sort_order} />
                        <input form={formId} name="note" className={inputClass} defaultValue={rule.note ?? ""} placeholder="Ghi chú" />
                        <CheckboxField form={formId} name="is_default" label="Mặc định" defaultChecked={rule.is_default} />
                        <CheckboxField form={formId} name="is_required" label="Bắt buộc chọn" defaultChecked={rule.is_required} />
                        <SimpleSelect form={formId} name="status" options={statusOptions} defaultValue={rule.status} />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Button form={formId} type="submit" size="sm">
                        <Save className="size-4" />
                        Lưu
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="overflow-x-auto rounded-lg border border-zinc-200">
          <table className="w-full min-w-[1400px] text-sm">
            <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3">Field form lead</th>
                <th className="px-4 py-3">Đối tượng</th>
                <th className="px-4 py-3">Hiển thị</th>
                <th className="px-4 py-3">Kiểu dữ liệu</th>
                <th className="px-4 py-3">Gợi ý</th>
                <th className="px-4 py-3">Cảnh báo</th>
                <th className="px-4 py-3">Lưu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {formFields.map((field) => {
                const formId = `field-${field.id}`;
                return (
                  <tr key={field.id} className="align-top">
                    <td className="px-4 py-4">
                      <p className="font-mono text-xs">{field.field_key}</p>
                      <StatusBadge status={field.field_status} />
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium">{field.segment_name}</p>
                      <p className="mt-1 font-mono text-xs text-zinc-500">{field.segment_code}</p>
                    </td>
                    <td className="px-4 py-4">
                      <form id={formId} action={updateAdmissionFormFieldConfigAction} className="contents">
                        <input type="hidden" name="field_id" value={field.id} />
                      </form>
                      <div className="grid gap-2">
                        <input form={formId} name="field_label" className={inputClass} defaultValue={field.field_label} required />
                        <input form={formId} name="field_group" className={inputClass} defaultValue={field.field_group} />
                        <div className="grid gap-2 sm:grid-cols-2">
                          <CheckboxField form={formId} name="is_visible" label="Hiển thị" defaultChecked={field.is_visible} />
                          <CheckboxField form={formId} name="is_required" label="Bắt buộc" defaultChecked={field.is_required} />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="grid gap-2">
                        <SimpleSelect form={formId} name="field_type" options={fieldTypes} defaultValue={field.field_type} />
                        <SimpleSelect form={formId} name="option_source" options={optionSources} defaultValue={field.option_source} />
                        <input form={formId} name="sort_order" type="number" className={inputClass} defaultValue={field.sort_order} />
                        <SimpleSelect form={formId} name="status" options={statusOptions} defaultValue={field.status} />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="grid gap-2">
                        <input form={formId} name="placeholder" className={inputClass} defaultValue={field.placeholder ?? ""} placeholder="Gợi ý nhập" />
                        <input form={formId} name="help_text" className={inputClass} defaultValue={field.help_text ?? ""} placeholder="Giải thích" />
                        <input form={formId} name="validation_rule" className={inputClass} defaultValue={field.validation_rule ?? ""} placeholder="Rule validate nếu có" />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <FlagList flags={field.control_flags} />
                    </td>
                    <td className="px-4 py-4">
                      <Button form={formId} type="submit" size="sm">
                        <Save className="size-4" />
                        Lưu
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="overflow-x-auto rounded-lg border border-zinc-200">
          <table className="w-full min-w-[1400px] text-sm">
            <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3">Điều kiện</th>
                <th className="px-4 py-3">Đối tượng</th>
                <th className="px-4 py-3">Cách chặn</th>
                <th className="px-4 py-3">Người phụ trách</th>
                <th className="px-4 py-3">Ghi chú rule</th>
                <th className="px-4 py-3">Cảnh báo</th>
                <th className="px-4 py-3">Lưu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {conditionRules.map((rule) => {
                const formId = `condition-${rule.id}`;
                return (
                  <tr key={rule.id} className="align-top">
                    <td className="px-4 py-4">
                      <p className="font-mono text-xs">{rule.condition_code}</p>
                      <StatusBadge status={rule.rule_status} />
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium">{rule.segment_name}</p>
                      <p className="mt-1 font-mono text-xs text-zinc-500">{rule.segment_code}</p>
                    </td>
                    <td className="px-4 py-4">
                      <form id={formId} action={updateAdmissionConditionRuleConfigAction} className="contents">
                        <input type="hidden" name="rule_id" value={rule.id} />
                      </form>
                      <div className="grid gap-2">
                        <input form={formId} name="condition_name" className={inputClass} defaultValue={rule.condition_name} required />
                        <SimpleSelect form={formId} name="condition_group" options={conditionGroups} defaultValue={rule.condition_group} />
                        <SimpleSelect form={formId} name="blocking_level" options={blockingLevels} defaultValue={rule.blocking_level} />
                        <div className="grid gap-2 sm:grid-cols-2">
                          <CheckboxField form={formId} name="is_required" label="Điều kiện bắt buộc" defaultChecked={rule.is_required} />
                          <CheckboxField form={formId} name="evidence_required" label="Cần minh chứng" defaultChecked={rule.evidence_required} />
                        </div>
                        <input form={formId} name="sort_order" type="number" className={inputClass} defaultValue={rule.sort_order} />
                        <SimpleSelect form={formId} name="status" options={statusOptions} defaultValue={rule.status} />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="grid gap-2">
                        <input form={formId} name="owner_department" className={inputClass} defaultValue={rule.owner_department ?? ""} placeholder="Phòng phụ trách" />
                        <input form={formId} name="checker_role" className={inputClass} defaultValue={rule.checker_role ?? ""} placeholder="Người kiểm tra" />
                        <input form={formId} name="approver_role" className={inputClass} defaultValue={rule.approver_role ?? ""} placeholder="Người duyệt" />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <textarea form={formId} name="rule_note" className={textareaClass} defaultValue={rule.rule_note ?? ""} />
                    </td>
                    <td className="px-4 py-4">
                      <FlagList flags={rule.control_flags} />
                    </td>
                    <td className="px-4 py-4">
                      <Button form={formId} type="submit" size="sm">
                        <Save className="size-4" />
                        Lưu
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
