"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Loader2, Save } from "lucide-react";

import { createLeadAction, type LeadFormState } from "@/app/leads/actions";
import { Button } from "@/components/ui/button";

type Option = {
  id: string;
  label: string;
};

type MajorOption = Option & {
  programId: string | null;
  programLabel: string | null;
};

type LeadFormProps = {
  sources: Option[];
  flows: Option[];
  campaigns: Option[];
  partners: Option[];
  segments: Option[];
  programs: Option[];
  majors: MajorOption[];
  houPrograms: Option[];
  houMajors: Option[];
  houLocations: Option[];
  houStages: Option[];
};

const initialState: LeadFormState = {};

const inputClass =
  "h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-zinc-500 focus:ring-3 focus:ring-zinc-200";

const textareaClass =
  "min-h-24 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-500 focus:ring-3 focus:ring-zinc-200";

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="text-sm font-medium text-zinc-700">
        {label}
        {required ? <span className="text-rose-600"> *</span> : null}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className={inputClass}
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  options,
  placeholder = "Chọn",
}: {
  label: string;
  name: string;
  options: Option[];
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="text-sm font-medium text-zinc-700">
        {label}
      </label>
      <select id={name} name={name} className={inputClass} defaultValue="">
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
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
}: LeadFormProps) {
  const [state, formAction, isPending] = useActionState(
    createLeadAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-6">
      {state.error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {state.error}
        </div>
      ) : null}

      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold">Thông tin học sinh</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Field
            label="Họ tên học sinh"
            name="student_name"
            required
            placeholder="Nguyễn Văn A"
          />
          <Field
            label="Số điện thoại học sinh"
            name="student_phone"
            placeholder="09xxxxxxxx"
          />
          <Field label="Ngày sinh" name="student_dob" type="date" />
          <div className="space-y-2">
            <label
              htmlFor="student_gender"
              className="text-sm font-medium text-zinc-700"
            >
              Giới tính
            </label>
            <select
              id="student_gender"
              name="student_gender"
              className={inputClass}
              defaultValue=""
            >
              <option value="">Chưa chọn</option>
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
              <option value="OTHER">Khác</option>
            </select>
          </div>
          <Field label="Trường hiện tại" name="current_school" />
          <Field label="Lớp hiện tại" name="current_grade" placeholder="9" />
          <Field
            label="Năm tốt nghiệp"
            name="graduation_year"
            type="number"
            placeholder="2026"
          />
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold">Thông tin phụ huynh</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Field label="Họ tên phụ huynh" name="parent_name" />
          <Field
            label="Số điện thoại phụ huynh"
            name="parent_phone"
            placeholder="09xxxxxxxx"
          />
          <Field
            label="Quan hệ"
            name="parent_relationship"
            placeholder="Bố / Mẹ / Người giám hộ"
          />
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold">Nhu cầu và nguồn lead</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="space-y-2">
            <label
              htmlFor="interested_program"
              className="text-sm font-medium text-zinc-700"
            >
              Hệ đào tạo quan tâm
            </label>
            <select
              id="interested_program"
              name="interested_program"
              className={inputClass}
              defaultValue=""
            >
              <option value="">Chưa chọn</option>
              {programs.map((program) => (
                <option key={program.id} value={program.label}>
                  {program.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="interested_major"
              className="text-sm font-medium text-zinc-700"
            >
              Ngành quan tâm
            </label>
            <select
              id="interested_major"
              name="interested_major"
              className={inputClass}
              defaultValue=""
            >
              <option value="">Chưa chọn</option>
              {programs.map((program) => {
                const programMajors = majors.filter(
                  (major) => major.programId === program.id,
                );

                if (programMajors.length === 0) {
                  return null;
                }

                return (
                  <optgroup key={program.id} label={program.label}>
                    {programMajors.map((major) => (
                      <option key={major.id} value={major.label}>
                        {major.label}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
              {majors
                .filter((major) => !major.programId)
                .map((major) => (
                  <option key={major.id} value={major.label}>
                    {major.label}
                  </option>
                ))}
            </select>
          </div>
          <SelectField
            label="Đối tượng tuyển sinh"
            name="admission_segment_id"
            options={segments}
            placeholder="Chọn đối tượng tuyển sinh"
          />
          <SelectField
            label="Nguồn lead"
            name="source_id"
            options={sources}
            placeholder="Chọn nguồn lead"
          />
          <SelectField
            label="Luồng tuyển sinh"
            name="flow_id"
            options={flows}
            placeholder="Chọn luồng tuyển sinh"
          />
          <SelectField
            label="Chiến dịch"
            name="campaign_id"
            options={campaigns}
            placeholder="Không gắn chiến dịch"
          />
          <SelectField
            label="Đối tác / CTV"
            name="partner_id"
            options={partners}
            placeholder="Không gắn đối tác"
          />
          <Field
            label="Tỉnh/thành"
            name="province"
            placeholder="Hà Nội"
          />
          <Field
            label="Xã/phường/đặc khu"
            name="ward"
            placeholder="Phường/Xã hiện tại"
          />
          <Field
            label="Quận/huyện cũ"
            name="district"
            placeholder="Chỉ nhập nếu là dữ liệu trước 01/07/2025"
          />
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold">Theo dõi HOU nếu là lead liên thông đại học</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Chỉ chọn phần này khi lead thuộc chương trình Đại học từ xa HOU. Nếu
          chưa chắc, có thể bỏ trống và cập nhật sau trong chi tiết lead.
        </p>
        {houPrograms.length === 0 ? (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Chưa đọc được dữ liệu HOU. Hãy kiểm tra lại bước 35A trên trang Cấu
            hình trước khi gắn HOU cho lead.
          </div>
        ) : null}
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SelectField
            label="Chương trình HOU"
            name="hou_program_id"
            options={houPrograms}
            placeholder="Không gắn HOU"
          />
          <SelectField
            label="Ngành HOU"
            name="hou_major_id"
            options={houMajors}
            placeholder="Chưa chọn ngành HOU"
          />
          <SelectField
            label="Địa điểm HOU"
            name="hou_location_id"
            options={houLocations}
            placeholder="Chưa chọn địa điểm"
          />
          <SelectField
            label="Bước xử lý HOU"
            name="hou_stage_id"
            options={houStages}
            placeholder="Chưa chọn bước"
          />
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold">Trạng thái chăm sóc</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="space-y-2">
            <label htmlFor="status" className="text-sm font-medium text-zinc-700">
              Trạng thái
            </label>
            <select
              id="status"
              name="status"
              className={inputClass}
              defaultValue="NEW"
            >
              <option value="NEW">Lead mới</option>
              <option value="CONTACTED">Đã liên hệ</option>
              <option value="INTERESTED">Có quan tâm</option>
              <option value="FOLLOW_UP">Cần chăm sóc tiếp</option>
            </select>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="priority"
              className="text-sm font-medium text-zinc-700"
            >
              Ưu tiên
            </label>
            <select
              id="priority"
              name="priority"
              className={inputClass}
              defaultValue="NORMAL"
            >
              <option value="LOW">Thấp</option>
              <option value="NORMAL">Bình thường</option>
              <option value="HIGH">Cao</option>
              <option value="URGENT">Khẩn cấp</option>
            </select>
          </div>
          <Field
            label="Ngày hẹn chăm sóc tiếp"
            name="next_followup_at"
            type="datetime-local"
          />
        </div>
        <div className="mt-4 space-y-2">
          <label htmlFor="note" className="text-sm font-medium text-zinc-700">
            Ghi chú
          </label>
          <textarea
            id="note"
            name="note"
            className={textareaClass}
            placeholder="Ghi nhanh nhu cầu, kết quả trao đổi hoặc việc cần làm tiếp theo."
          />
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button asChild variant="outline">
          <Link href="/leads">Hủy</Link>
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
