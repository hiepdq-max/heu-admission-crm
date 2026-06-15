"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Loader2, Save } from "lucide-react";

import {
  createPartnerAction,
  type PartnerFormState,
} from "@/app/partners/actions";
import { Button } from "@/components/ui/button";

const initialState: PartnerFormState = {};

const inputClass =
  "h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-zinc-500 focus:ring-3 focus:ring-zinc-200";

const textareaClass =
  "min-h-24 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-500 focus:ring-3 focus:ring-zinc-200";

function Field({
  label,
  name,
  required,
  placeholder,
  type = "text",
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
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

export function PartnerForm() {
  const [state, formAction, isPending] = useActionState(
    createPartnerAction,
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
        <h2 className="text-base font-semibold">Thông tin đối tác</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Field
            label="Mã đối tác"
            name="partner_code"
            required
            placeholder="CTV-0002"
          />
          <Field
            label="Tên đối tác"
            name="partner_name"
            required
            placeholder="Nguyễn Văn A / TTGDTX..."
          />
          <div className="space-y-2">
            <label
              htmlFor="partner_type"
              className="text-sm font-medium text-zinc-700"
            >
              Loại đối tác <span className="text-rose-600">*</span>
            </label>
            <select
              id="partner_type"
              name="partner_type"
              className={inputClass}
              defaultValue="CTV"
              required
            >
              <option value="CTV">CTV</option>
              <option value="THCS">Trường THCS</option>
              <option value="TTGDTX">TTGDTX</option>
              <option value="BUSINESS">Doanh nghiệp</option>
              <option value="OTHER">Khác</option>
            </select>
          </div>
          <Field label="Số điện thoại" name="phone" placeholder="09xxxxxxxx" />
          <Field label="Email" name="email" type="email" placeholder="email@..." />
          <Field label="Khu vực" name="area" placeholder="Hà Nội, Vĩnh Phúc..." />
          <div className="space-y-2">
            <label htmlFor="status" className="text-sm font-medium text-zinc-700">
              Trạng thái
            </label>
            <select
              id="status"
              name="status"
              className={inputClass}
              defaultValue="ACTIVE"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
          <Field
            label="Trạng thái hợp đồng"
            name="contract_status"
            placeholder="DRAFT / SIGNED / NO_CONTRACT..."
          />
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold">COM / ghi chú hợp tác</h2>
        <p className="mt-1 text-sm text-zinc-500">
          V01 chỉ lưu mô tả COM, chưa tự động tính hoặc chi hoa hồng.
        </p>
        <div className="mt-4 space-y-2">
          <label
            htmlFor="commission_note"
            className="text-sm font-medium text-zinc-700"
          >
            Ghi chú COM
          </label>
          <textarea
            id="commission_note"
            name="commission_note"
            className={textareaClass}
            placeholder="Ví dụ: COM theo thỏa thuận, đối soát cuối tháng..."
          />
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button asChild variant="outline">
          <Link href="/partners">Hủy</Link>
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Lưu đối tác
        </Button>
      </div>
    </form>
  );
}
