"use client";

import { useActionState } from "react";
import { GraduationCap, Loader2, Save } from "lucide-react";

import {
  updateLeadHouAction,
  type HouLeadFormState,
} from "@/app/leads/[id]/actions";
import { Button } from "@/components/ui/button";

type Option = {
  id: string;
  label: string;
};

type HouLeadFormProps = {
  leadId: string;
  currentProgramId: string | null;
  currentMajorId: string | null;
  currentLocationId: string | null;
  currentStageId: string | null;
  currentAdmissionSystemStatus: string | null;
  currentAdmissionSystemSyncedAt: string | null;
  currentFirstTermTuitionConfirmed: boolean;
  currentFirstTermTuitionConfirmedAt: string | null;
  currentEnrollmentRecordedAt: string | null;
  programs: Option[];
  majors: Option[];
  locations: Option[];
  stages: Option[];
};

const initialState: HouLeadFormState = {};

const inputClass =
  "h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-zinc-500 focus:ring-3 focus:ring-zinc-200";

function toDateTimeLocal(value: string | null) {
  if (!value) {
    return "";
  }

  return value.slice(0, 16);
}

function fieldValue(state: HouLeadFormState, name: string, fallback = "") {
  return state.fields?.[name] ?? fallback;
}

function fieldError(state: HouLeadFormState, name: string) {
  return state.fieldErrors?.[name];
}

function fieldClass(
  state: HouLeadFormState,
  name: string,
  baseClass = inputClass,
) {
  return fieldError(state, name)
    ? baseClass.replace("border-zinc-300", "border-rose-300").replace(
        "focus:border-zinc-500",
        "focus:border-rose-500",
      )
    : baseClass;
}

function FieldError({ state, name }: { state: HouLeadFormState; name: string }) {
  const message = fieldError(state, name);

  if (!message) {
    return null;
  }

  return <p className="text-xs font-medium text-rose-600">{message}</p>;
}

function SelectField({
  label,
  name,
  options,
  defaultValue,
  error,
  placeholder = "Chọn",
}: {
  label: string;
  name: string;
  options: Option[];
  defaultValue: string | null;
  error?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="text-sm font-medium text-zinc-700">
        {label}
      </label>
      <select
        id={name}
        name={name}
        className={
          error
            ? inputClass
                .replace("border-zinc-300", "border-rose-300")
                .replace("focus:border-zinc-500", "focus:border-rose-500")
            : inputClass
        }
        defaultValue={defaultValue ?? ""}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <p className="text-xs font-medium text-rose-600">{error}</p> : null}
    </div>
  );
}

export function HouLeadForm({
  leadId,
  currentProgramId,
  currentMajorId,
  currentLocationId,
  currentStageId,
  currentAdmissionSystemStatus,
  currentAdmissionSystemSyncedAt,
  currentFirstTermTuitionConfirmed,
  currentFirstTermTuitionConfirmedAt,
  currentEnrollmentRecordedAt,
  programs,
  majors,
  locations,
  stages,
}: HouLeadFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateLeadHouAction,
    initialState,
  );

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-zinc-100">
          <GraduationCap className="size-5 text-zinc-600" />
        </div>
        <div>
          <h3 className="text-base font-semibold">Theo dõi HOU</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Gắn lead với chương trình Đại học từ xa HOU, ngành HOU, địa điểm,
            bước xử lý và xác nhận học phí kỳ đầu.
          </p>
        </div>
      </div>

      {state.error ? (
        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {state.error}
        </div>
      ) : null}

      {state.success ? (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {state.success}
        </div>
      ) : null}

      {programs.length === 0 ? (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Chưa đọc được dữ liệu HOU. Hãy kiểm tra lại bước 35A trên trang Cấu
          hình hoặc chạy file SQL bước 35A.
        </div>
      ) : null}

      <form
        key={
          state.success
            ? "success"
            : state.error
              ? JSON.stringify(state.fields ?? {})
              : "initial"
        }
        action={formAction}
        className="mt-5 space-y-5"
      >
        <input type="hidden" name="lead_id" value={leadId} />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SelectField
            label="Chương trình HOU"
            name="hou_program_id"
            options={programs}
            defaultValue={fieldValue(state, "hou_program_id", currentProgramId ?? "")}
            error={fieldError(state, "hou_program_id")}
            placeholder="Không gắn HOU"
          />
          <SelectField
            label="Ngành HOU"
            name="hou_major_id"
            options={majors}
            defaultValue={fieldValue(state, "hou_major_id", currentMajorId ?? "")}
            error={fieldError(state, "hou_major_id")}
            placeholder="Chưa chọn ngành HOU"
          />
          <SelectField
            label="Địa điểm HOU"
            name="hou_location_id"
            options={locations}
            defaultValue={fieldValue(state, "hou_location_id", currentLocationId ?? "")}
            error={fieldError(state, "hou_location_id")}
            placeholder="Chưa chọn địa điểm"
          />
          <SelectField
            label="Bước xử lý HOU"
            name="hou_stage_id"
            options={stages}
            defaultValue={fieldValue(state, "hou_stage_id", currentStageId ?? "")}
            error={fieldError(state, "hou_stage_id")}
            placeholder="Chưa chọn bước"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="space-y-2">
            <label
              htmlFor="hou_admission_system_status"
              className="text-sm font-medium text-zinc-700"
            >
              Trạng thái trên hệ thống HOU
            </label>
            <input
              id="hou_admission_system_status"
              name="hou_admission_system_status"
              className={fieldClass(state, "hou_admission_system_status")}
              defaultValue={fieldValue(
                state,
                "hou_admission_system_status",
                currentAdmissionSystemStatus ?? "",
              )}
              placeholder="Ví dụ: đã nhập, chờ HOU duyệt..."
            />
            <FieldError state={state} name="hou_admission_system_status" />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="hou_admission_system_synced_at"
              className="text-sm font-medium text-zinc-700"
            >
              Thời điểm nhập/cập nhật hệ thống HOU
            </label>
            <input
              id="hou_admission_system_synced_at"
              name="hou_admission_system_synced_at"
              type="datetime-local"
              className={fieldClass(state, "hou_admission_system_synced_at")}
              defaultValue={fieldValue(
                state,
                "hou_admission_system_synced_at",
                toDateTimeLocal(currentAdmissionSystemSyncedAt),
              )}
            />
            <FieldError state={state} name="hou_admission_system_synced_at" />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="hou_enrollment_recorded_at"
              className="text-sm font-medium text-zinc-700"
            >
              Thời điểm ghi nhận nhập học HOU
            </label>
            <input
              id="hou_enrollment_recorded_at"
              name="hou_enrollment_recorded_at"
              type="datetime-local"
              className={fieldClass(state, "hou_enrollment_recorded_at")}
              defaultValue={fieldValue(
                state,
                "hou_enrollment_recorded_at",
                toDateTimeLocal(currentEnrollmentRecordedAt),
              )}
            />
            <FieldError state={state} name="hou_enrollment_recorded_at" />
          </div>
        </div>

        <div className="grid gap-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 md:grid-cols-[1fr_260px]">
          <label className="flex items-start gap-3 text-sm text-zinc-700">
            <input
              name="hou_first_term_tuition_confirmed"
              type="checkbox"
              className="mt-1 size-4 rounded border-zinc-300"
              defaultChecked={
                state.error
                  ? fieldValue(state, "hou_first_term_tuition_confirmed") === "on"
                  : currentFirstTermTuitionConfirmed
              }
            />
            <span>
              <span className="block font-medium text-zinc-950">
                Đã xác nhận học phí kỳ đầu
              </span>
              <span className="mt-1 block text-zinc-500">
                Dùng để đối chiếu điều kiện hỗ trợ tuyển sinh HOU 600.000đ/học
                viên ở bước sau.
              </span>
            </span>
          </label>
          <div className="space-y-2">
            <label
              htmlFor="hou_first_term_tuition_confirmed_at"
              className="text-sm font-medium text-zinc-700"
            >
              Thời điểm xác nhận
            </label>
            <input
              id="hou_first_term_tuition_confirmed_at"
              name="hou_first_term_tuition_confirmed_at"
              type="datetime-local"
              className={fieldClass(state, "hou_first_term_tuition_confirmed_at")}
              defaultValue={fieldValue(
                state,
                "hou_first_term_tuition_confirmed_at",
                toDateTimeLocal(currentFirstTermTuitionConfirmedAt),
              )}
            />
            <FieldError state={state} name="hou_first_term_tuition_confirmed_at" />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending || programs.length === 0}>
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Lưu thông tin HOU
          </Button>
        </div>
      </form>
    </section>
  );
}
