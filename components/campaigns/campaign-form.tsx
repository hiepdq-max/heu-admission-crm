"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Loader2, Save } from "lucide-react";

import {
  createCampaignAction,
  type CampaignFormState,
} from "@/app/campaigns/actions";
import { Button } from "@/components/ui/button";

type Option = {
  id: string;
  label: string;
};

type CampaignFormProps = {
  sources: Option[];
};

const initialState: CampaignFormState = {};

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

export function CampaignForm({ sources }: CampaignFormProps) {
  const [state, formAction, isPending] = useActionState(
    createCampaignAction,
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
        <h2 className="text-base font-semibold">Thông tin chiến dịch</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Field
            label="Mã chiến dịch"
            name="campaign_code"
            required
            placeholder="TS2026-FB-Q4"
          />
          <Field
            label="Tên chiến dịch"
            name="campaign_name"
            required
            placeholder="Tuyển sinh 2026 - Facebook Q4"
          />
          <div className="space-y-2">
            <label htmlFor="source_id" className="text-sm font-medium text-zinc-700">
              Nguồn lead
            </label>
            <select
              id="source_id"
              name="source_id"
              className={inputClass}
              defaultValue=""
            >
              <option value="">Không gắn nguồn</option>
              {sources.map((source) => (
                <option key={source.id} value={source.id}>
                  {source.label}
                </option>
              ))}
            </select>
          </div>
          <Field label="Ngày bắt đầu" name="start_date" type="date" />
          <Field label="Ngày kết thúc" name="end_date" type="date" />
          <Field
            label="Ngân sách dự kiến"
            name="budget"
            type="number"
            placeholder="10000000"
          />
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
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold">Ghi chú</h2>
        <div className="mt-4 space-y-2">
          <label htmlFor="note" className="text-sm font-medium text-zinc-700">
            Mô tả chiến dịch
          </label>
          <textarea
            id="note"
            name="note"
            className={textareaClass}
            placeholder="Mục tiêu, kênh chạy, khu vực, đối tượng tuyển sinh..."
          />
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button asChild variant="outline">
          <Link href="/campaigns">Hủy</Link>
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Lưu chiến dịch
        </Button>
      </div>
    </form>
  );
}
