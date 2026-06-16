"use client";

import Link from "next/link";
import { useActionState, useMemo, useState, type ReactNode } from "react";
import { AlertTriangle, Loader2, Save } from "lucide-react";

import { createLeadAction, type LeadFormState } from "@/app/leads/actions";
import { Button } from "@/components/ui/button";
import type { LeadDynamicField } from "@/lib/admission-dynamic-fields";

type Option = {
  id: string;
  label: string;
};

type SegmentOption = Option & {
  code?: string;
  programGroup?: string;
};

type MajorOption = Option & {
  code?: string;
  programId: string | null;
  programLabel: string | null;
  programCode: string | null;
};

type LeadFormProps = {
  sources: Option[];
  flows: Option[];
  campaigns: Option[];
  partners: Option[];
  segments: SegmentOption[];
  programs: Option[];
  majors: MajorOption[];
  houPrograms: Option[];
  houMajors: Option[];
  houLocations: Option[];
  houStages: Option[];
  hasSegmentScope: boolean;
  hasPartnerScope: boolean;
  defaultSegmentId: string | null;
  lockSegmentSelection?: boolean;
  dynamicFields: LeadDynamicField[];
  dynamicConfigError?: string;
  cancelHref?: string;
};

const initialState: LeadFormState = {};

const inputClass =
  "h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-zinc-500 focus:ring-3 focus:ring-zinc-200";
const textareaClass =
  "min-h-28 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-500 focus:ring-3 focus:ring-zinc-200";

const genderOptions = [
  { id: "Nam", label: "Nam" },
  { id: "Nữ", label: "Nữ" },
  { id: "Khác", label: "Khác" },
];

const statusOptions = [
  { id: "NEW", label: "Lead mới" },
  { id: "ASSIGNED", label: "Đã phân tư vấn" },
  { id: "CONTACTED", label: "Đã liên hệ" },
  { id: "INTERESTED", label: "Có quan tâm" },
  { id: "FOLLOW_UP", label: "Chăm sóc tiếp" },
  { id: "DOCUMENT_PENDING", label: "Chờ hồ sơ" },
  { id: "DOCUMENT_SUBMITTED", label: "Đã nộp hồ sơ" },
  { id: "ELIGIBLE", label: "Đủ điều kiện" },
  { id: "ENROLLED", label: "Đã nhập học" },
  { id: "LOST", label: "Không đăng ký" },
];

const priorityOptions = [
  { id: "LOW", label: "Thấp" },
  { id: "NORMAL", label: "Bình thường" },
  { id: "HIGH", label: "Cao" },
  { id: "URGENT", label: "Khẩn cấp" },
];

function fieldValue(state: LeadFormState, name: string, fallback = "") {
  return state.fields?.[name] ?? fallback;
}

function fieldError(state: LeadFormState, name: string) {
  return state.fieldErrors?.[name];
}

function classForField(
  state: LeadFormState,
  name: string,
  baseClass = inputClass,
) {
  return fieldError(state, name)
    ? baseClass
        .replace("border-zinc-300", "border-rose-300")
        .replace("focus:border-zinc-500", "focus:border-rose-500")
    : baseClass;
}

function RequiredMark({ required }: { required?: boolean }) {
  if (!required) {
    return null;
  }

  return <span className="text-rose-600"> *</span>;
}

function FieldError({ state, name }: { state: LeadFormState; name: string }) {
  const message = fieldError(state, name);

  if (!message) {
    return null;
  }

  return <p className="text-xs font-medium text-rose-600">{message}</p>;
}

function FieldHelp({ value }: { value?: string | null }) {
  if (!value) {
    return null;
  }

  return <p className="text-xs leading-5 text-zinc-500">{value}</p>;
}

function Section({
  title,
  description,
  children,
  visible = true,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  visible?: boolean;
}) {
  if (!visible) {
    return null;
  }

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm leading-6 text-zinc-500">{description}</p>
        ) : null}
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {children}
      </div>
    </section>
  );
}

export function LeadForm({
  sources,
  flows,
  campaigns,
  partners,
  segments,
  programs,
  majors,
  houPrograms,
  houMajors,
  houLocations,
  houStages,
  hasSegmentScope,
  hasPartnerScope,
  defaultSegmentId,
  lockSegmentSelection = false,
  dynamicFields,
  dynamicConfigError,
  cancelHref = "/leads",
}: LeadFormProps) {
  const [state, formAction, isPending] = useActionState(
    createLeadAction,
    initialState,
  );
  const fieldMap = useMemo(
    () => new Map(dynamicFields.map((field) => [field.form_name, field])),
    [dynamicFields],
  );
  const usesDynamicConfig = dynamicFields.length > 0;
  const activeSegment = segments.find((segment) => segment.id === defaultSegmentId);
  const initialProgramId =
    fieldValue(state, "interested_program_id") ||
    (programs.length === 1 ? programs[0].id : "");
  const [selectedProgramId, setSelectedProgramId] = useState(initialProgramId);
  const [selectedMajorId, setSelectedMajorId] = useState(
    fieldValue(state, "interested_major_id"),
  );
  const visibleMajors = useMemo(() => {
    if (!selectedProgramId) {
      return majors;
    }

    return majors.filter(
      (major) => !major.programId || major.programId === selectedProgramId,
    );
  }, [majors, selectedProgramId]);
  const selectedProgram = programs.find((program) => program.id === selectedProgramId);
  const selectedMajor = majors.find((major) => major.id === selectedMajorId);
  const customFields = dynamicFields.filter((field) => field.is_custom);

  const fieldConfig = (name: string) => fieldMap.get(name);
  const showField = (name: string) => !usesDynamicConfig || fieldMap.has(name);
  const labelFor = (name: string, fallback: string) =>
    fieldConfig(name)?.field_label ?? fallback;
  const requiredFor = (name: string, fallback = false) =>
    fieldConfig(name)?.is_required ?? fallback;
  const placeholderFor = (name: string, fallback = "") =>
    fieldConfig(name)?.placeholder ?? fallback;
  const helpFor = (name: string) => fieldConfig(name)?.help_text;

  function renderTextInput({
    name,
    label,
    type = "text",
    placeholder,
    required,
    alwaysVisible = false,
  }: {
    name: string;
    label: string;
    type?: string;
    placeholder?: string;
    required?: boolean;
    alwaysVisible?: boolean;
  }) {
    if (!alwaysVisible && !showField(name)) {
      return null;
    }

    return (
      <div className="space-y-2">
        <label htmlFor={name} className="text-sm font-medium text-zinc-700">
          {labelFor(name, label)}
          <RequiredMark required={requiredFor(name, required)} />
        </label>
        <input
          id={name}
          name={name}
          type={type}
          className={classForField(state, name)}
          defaultValue={fieldValue(state, name)}
          placeholder={placeholderFor(name, placeholder)}
        />
        <FieldHelp value={helpFor(name)} />
        <FieldError state={state} name={name} />
      </div>
    );
  }

  function renderSelectInput({
    name,
    label,
    options,
    placeholder = "Chọn",
    required,
    alwaysVisible = false,
  }: {
    name: string;
    label: string;
    options: Option[];
    placeholder?: string;
    required?: boolean;
    alwaysVisible?: boolean;
  }) {
    if (!alwaysVisible && !showField(name)) {
      return null;
    }

    return (
      <div className="space-y-2">
        <label htmlFor={name} className="text-sm font-medium text-zinc-700">
          {labelFor(name, label)}
          <RequiredMark required={requiredFor(name, required)} />
        </label>
        <select
          id={name}
          name={name}
          className={classForField(state, name)}
          defaultValue={fieldValue(state, name)}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
        <FieldHelp value={helpFor(name)} />
        <FieldError state={state} name={name} />
      </div>
    );
  }

  function renderTextareaInput({
    name,
    label,
    alwaysVisible = false,
  }: {
    name: string;
    label: string;
    alwaysVisible?: boolean;
  }) {
    if (!alwaysVisible && !showField(name)) {
      return null;
    }

    return (
      <div className="space-y-2 md:col-span-2 xl:col-span-3">
        <label htmlFor={name} className="text-sm font-medium text-zinc-700">
          {labelFor(name, label)}
          <RequiredMark required={requiredFor(name)} />
        </label>
        <textarea
          id={name}
          name={name}
          className={classForField(state, name, textareaClass)}
          defaultValue={fieldValue(state, name)}
          placeholder={placeholderFor(name)}
        />
        <FieldHelp value={helpFor(name)} />
        <FieldError state={state} name={name} />
      </div>
    );
  }

  function renderCustomField(field: LeadDynamicField) {
    const isCheckbox = field.field_type === "CHECKBOX";
    const value = fieldValue(state, field.form_name);

    if (isCheckbox) {
      return (
        <div className="space-y-2 rounded-md border border-zinc-200 bg-zinc-50 p-3">
          <label
            htmlFor={field.form_name}
            className="flex items-start gap-3 text-sm font-medium text-zinc-700"
          >
            <input
              id={field.form_name}
              name={field.form_name}
              type="checkbox"
              className="mt-1 size-4 rounded border-zinc-300"
              defaultChecked={value === "on" || value === "true"}
            />
            <span>
              {field.field_label}
              <RequiredMark required={field.is_required} />
            </span>
          </label>
          <FieldHelp value={field.help_text} />
          <FieldError state={state} name={field.form_name} />
        </div>
      );
    }

    const inputType =
      field.field_type === "DATE"
        ? "date"
        : field.field_type === "DATETIME"
          ? "datetime-local"
          : field.field_type === "NUMBER" || field.field_type === "MONEY"
            ? "number"
            : field.field_type === "EMAIL"
              ? "email"
              : field.field_type === "PHONE"
                ? "tel"
                : field.field_type === "FILE_URL"
                  ? "url"
                  : "text";

    if (field.field_type === "TEXTAREA") {
      return (
        <div className="space-y-2 md:col-span-2 xl:col-span-3">
          <label
            htmlFor={field.form_name}
            className="text-sm font-medium text-zinc-700"
          >
            {field.field_label}
            <RequiredMark required={field.is_required} />
          </label>
          <textarea
            id={field.form_name}
            name={field.form_name}
            className={classForField(state, field.form_name, textareaClass)}
            defaultValue={value}
            placeholder={field.placeholder ?? undefined}
          />
          <FieldHelp value={field.help_text} />
          <FieldError state={state} name={field.form_name} />
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <label
          htmlFor={field.form_name}
          className="text-sm font-medium text-zinc-700"
        >
          {field.field_label}
          <RequiredMark required={field.is_required} />
        </label>
        <input
          id={field.form_name}
          name={field.form_name}
          type={inputType}
          className={classForField(state, field.form_name)}
          defaultValue={value}
          placeholder={field.placeholder ?? undefined}
        />
        <FieldHelp value={field.help_text} />
        <FieldError state={state} name={field.form_name} />
      </div>
    );
  }

  const hasHouSection =
    activeSegment?.code === "UNIVERSITY_TRANSFER_HOU" ||
    ["hou_program_id", "hou_major_id", "hou_location_id", "hou_stage_id", "hou_first_term_tuition_confirmed"].some(
      (name) => showField(name) && usesDynamicConfig,
    );

  return (
    <form action={formAction} className="space-y-6">
      {state.error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-700">
          {state.error}
        </div>
      ) : null}

      {dynamicConfigError ? (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <p>
            Chưa đọc được cấu hình form P0-17 nên hệ thống đang dùng form dự
            phòng. Chi tiết: {dynamicConfigError}
          </p>
        </div>
      ) : null}

      {!usesDynamicConfig && !dynamicConfigError ? (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <p>
            Đối tượng tuyển sinh này chưa có field active ở P0-17. Form vẫn cho
            nhập theo mẫu dự phòng, nhưng nên cấu hình field trước khi vận hành
            thật.
          </p>
        </div>
      ) : null}

      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Workspace tuyển sinh</h2>
            <p className="mt-1 text-sm leading-6 text-zinc-500">
              Lead được tạo trong đúng đối tượng tuyển sinh đang chọn. Danh sách
              hệ/ngành, HOU, đối tác và field bắt buộc sẽ đi theo lựa chọn này.
            </p>
          </div>
          <div className="lg:min-w-[360px]">
            {lockSegmentSelection ? (
              <>
                <input
                  type="hidden"
                  name="admission_segment_id"
                  value={defaultSegmentId ?? ""}
                />
                <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-700">
                  {activeSegment?.label ?? "Chưa chọn đối tượng tuyển sinh"}
                </div>
              </>
            ) : (
              <select
                name="admission_segment_id"
                className={classForField(state, "admission_segment_id")}
                defaultValue={defaultSegmentId ?? ""}
              >
                <option value="">Chọn đối tượng tuyển sinh</option>
                {segments.map((segment) => (
                  <option key={segment.id} value={segment.id}>
                    {segment.label}
                  </option>
                ))}
              </select>
            )}
            <FieldError state={state} name="admission_segment_id" />
            {!hasSegmentScope ? (
              <p className="mt-2 text-xs leading-5 text-amber-700">
                Tài khoản chưa có phạm vi đối tượng tuyển sinh riêng. ADMIN/BGH
                vẫn có thể thấy toàn bộ; nhân viên cần được phân phạm vi trước.
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <Section title="Thông tin học sinh" description="Thông tin định danh ban đầu của người học.">
        {renderTextInput({ name: "student_name", label: "Họ tên học sinh", required: true })}
        {renderTextInput({ name: "student_phone", label: "SĐT học sinh", type: "tel" })}
        {renderTextInput({ name: "student_dob", label: "Ngày sinh", type: "date" })}
        {renderSelectInput({
          name: "student_gender",
          label: "Giới tính",
          options: genderOptions,
        })}
        {renderTextInput({ name: "current_school", label: "Trường hiện tại" })}
        {renderTextInput({ name: "current_grade", label: "Lớp hiện tại" })}
        {renderTextInput({
          name: "graduation_year",
          label: "Năm tốt nghiệp",
          type: "number",
        })}
      </Section>

      <Section title="Phụ huynh / người giám hộ">
        {renderTextInput({ name: "parent_name", label: "Họ tên phụ huynh" })}
        {renderTextInput({ name: "parent_phone", label: "SĐT phụ huynh", type: "tel" })}
        {renderTextInput({ name: "parent_relationship", label: "Quan hệ" })}
      </Section>

      <Section
        title="Nhu cầu tuyển sinh"
        description="Hệ đào tạo và ngành được lọc theo đúng đối tượng tuyển sinh đang làm việc."
      >
        {showField("interested_program_id") ? (
          <div className="space-y-2">
            <label
              htmlFor="interested_program_id"
              className="text-sm font-medium text-zinc-700"
            >
              {labelFor("interested_program_id", "Hệ đào tạo")}
              <RequiredMark required={requiredFor("interested_program_id", true)} />
            </label>
            <select
              id="interested_program_id"
              name="interested_program_id"
              className={classForField(state, "interested_program_id")}
              value={selectedProgramId}
              onChange={(event) => {
                setSelectedProgramId(event.target.value);
                setSelectedMajorId("");
              }}
            >
              <option value="">Chọn hệ đào tạo</option>
              {programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.label}
                </option>
              ))}
            </select>
            <input
              type="hidden"
              name="interested_program"
              value={selectedProgram?.label ?? ""}
            />
            <FieldHelp value={helpFor("interested_program_id")} />
            <FieldError state={state} name="interested_program_id" />
          </div>
        ) : null}

        {showField("interested_major_id") ? (
          <div className="space-y-2">
            <label
              htmlFor="interested_major_id"
              className="text-sm font-medium text-zinc-700"
            >
              {labelFor("interested_major_id", "Ngành quan tâm")}
              <RequiredMark required={requiredFor("interested_major_id", true)} />
            </label>
            <select
              id="interested_major_id"
              name="interested_major_id"
              className={classForField(state, "interested_major_id")}
              value={selectedMajorId}
              onChange={(event) => setSelectedMajorId(event.target.value)}
            >
              <option value="">
                {selectedProgramId ? "Chọn ngành" : "Chọn hệ đào tạo trước"}
              </option>
              {visibleMajors.map((major) => (
                <option key={major.id} value={major.id}>
                  {major.label}
                </option>
              ))}
            </select>
            <input
              type="hidden"
              name="interested_major"
              value={selectedMajor?.label ?? ""}
            />
            <FieldHelp value={helpFor("interested_major_id")} />
            <FieldError state={state} name="interested_major_id" />
          </div>
        ) : null}

        {renderSelectInput({ name: "source_id", label: "Nguồn lead", options: sources })}
        {renderSelectInput({ name: "flow_id", label: "Luồng tuyển sinh", options: flows })}
        {renderSelectInput({
          name: "campaign_id",
          label: "Chiến dịch",
          options: campaigns,
        })}
        {renderSelectInput({
          name: "partner_id",
          label: "Đối tác / CTV / Trung tâm",
          options: partners,
          required: hasPartnerScope,
          placeholder: hasPartnerScope
            ? "Chọn đúng đối tác được phân"
            : "Không chọn nếu tuyển sinh trực tiếp",
        })}
        {renderTextInput({ name: "province", label: "Tỉnh/thành phố" })}
        {renderTextInput({ name: "ward", label: "Xã/phường" })}
        {renderTextInput({ name: "district", label: "Quận/huyện cũ nếu có" })}
      </Section>

      <Section
        title="Thông tin HOU"
        description="Chỉ dùng cho đối tượng liên thông đại học HOU."
        visible={hasHouSection}
      >
        {renderSelectInput({
          name: "hou_program_id",
          label: "Chương trình HOU",
          options: houPrograms,
        })}
        {renderSelectInput({
          name: "hou_major_id",
          label: "Ngành HOU",
          options: houMajors,
        })}
        {renderSelectInput({
          name: "hou_location_id",
          label: "Địa điểm học HOU",
          options: houLocations,
        })}
        {renderSelectInput({
          name: "hou_stage_id",
          label: "Bước xử lý HOU",
          options: houStages,
        })}
        {showField("hou_first_term_tuition_confirmed") ? (
          <div className="space-y-2 rounded-md border border-zinc-200 bg-zinc-50 p-3">
            <label
              htmlFor="hou_first_term_tuition_confirmed"
              className="flex items-start gap-3 text-sm font-medium text-zinc-700"
            >
              <input
                id="hou_first_term_tuition_confirmed"
                name="hou_first_term_tuition_confirmed"
                type="checkbox"
                className="mt-1 size-4 rounded border-zinc-300"
                defaultChecked={
                  fieldValue(state, "hou_first_term_tuition_confirmed") === "on"
                }
              />
              <span>
                {labelFor(
                  "hou_first_term_tuition_confirmed",
                  "Đã xác nhận học phí kỳ đầu",
                )}
                <RequiredMark
                  required={requiredFor("hou_first_term_tuition_confirmed")}
                />
              </span>
            </label>
            <FieldHelp value={helpFor("hou_first_term_tuition_confirmed")} />
            <FieldError state={state} name="hou_first_term_tuition_confirmed" />
          </div>
        ) : null}
      </Section>

      <Section
        title="Thông tin bổ sung theo P0-17"
        description="Các field tùy biến do nhà trường bật riêng cho từng đối tượng tuyển sinh."
        visible={customFields.length > 0}
      >
        {customFields.map((field) => (
          <div key={field.id}>{renderCustomField(field)}</div>
        ))}
      </Section>

      <Section title="Trạng thái chăm sóc">
        {renderSelectInput({
          name: "status",
          label: "Trạng thái ban đầu",
          options: statusOptions,
          placeholder: "Chọn trạng thái",
          alwaysVisible: true,
        })}
        {renderSelectInput({
          name: "priority",
          label: "Mức ưu tiên",
          options: priorityOptions,
          placeholder: "Chọn mức ưu tiên",
          alwaysVisible: true,
        })}
        {renderTextInput({
          name: "next_followup_at",
          label: "Ngày hẹn chăm sóc tiếp",
          type: "datetime-local",
          alwaysVisible: true,
        })}
        {renderTextareaInput({ name: "note", label: "Ghi chú tư vấn" })}
      </Section>

      <div className="flex flex-col-reverse gap-3 border-t border-zinc-200 pt-5 sm:flex-row sm:justify-end">
        <Button asChild variant="outline">
          <Link href={cancelHref}>Hủy</Link>
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Lưu lead
        </Button>
      </div>
    </form>
  );
}
