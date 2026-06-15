import { RadioTower, Save, SquarePlus } from "lucide-react";

import {
  createLeadSourceAction,
  updateLeadSourceAction,
} from "@/app/settings/actions";
import { Button } from "@/components/ui/button";

export type LeadSourceMasterRow = {
  id: string;
  source_code: string;
  source_name: string;
  source_group: string;
  status: string;
  created_at: string;
};

type LeadSourceSettingsProps = {
  sources: LeadSourceMasterRow[];
};

const inputClass =
  "h-9 w-full rounded-md border border-zinc-300 bg-white px-2 text-sm outline-none transition focus:border-zinc-500 focus:ring-3 focus:ring-zinc-200";

const sourceGroupOptions = [
  "Online",
  "Direct",
  "Partner",
  "School",
  "Referral",
  "Offline",
  "Import",
  "Other",
];

function SourceGroupSelect({
  form,
  defaultValue,
}: {
  form?: string;
  defaultValue?: string | null;
}) {
  const hasCustomValue =
    defaultValue && !sourceGroupOptions.includes(defaultValue);

  return (
    <select
      form={form}
      name="source_group"
      className={inputClass}
      defaultValue={defaultValue ?? "Online"}
    >
      {sourceGroupOptions.map((group) => (
        <option key={group} value={group}>
          {group}
        </option>
      ))}
      {hasCustomValue ? <option value={defaultValue}>{defaultValue}</option> : null}
    </select>
  );
}

export function LeadSourceSettings({ sources }: LeadSourceSettingsProps) {
  const activeCount = sources.filter((source) => source.status === "ACTIVE").length;
  const groups = new Set(sources.map((source) => source.source_group));

  return (
    <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-zinc-100">
            <RadioTower className="size-5 text-zinc-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold">Nguồn lead master</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Quản lý nguồn lead dùng trong tạo lead, chiến dịch, báo cáo và
              import. Có {activeCount} nguồn active trong {groups.size} nhóm.
            </p>
          </div>
        </div>
      </div>

      <form
        action={createLeadSourceAction}
        className="border-b border-zinc-200 bg-zinc-50 p-5"
      >
        <h3 className="text-sm font-semibold">Thêm nguồn lead mới</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-[170px_minmax(220px,1fr)_160px_130px_auto]">
          <input
            name="source_code"
            className={inputClass}
            placeholder="YOUTUBE"
            required
          />
          <input
            name="source_name"
            className={inputClass}
            placeholder="YouTube Ads"
            required
          />
          <SourceGroupSelect />
          <select name="status" className={inputClass} defaultValue="ACTIVE">
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
          <Button type="submit" size="sm">
            <SquarePlus className="size-4" />
            Thêm
          </Button>
        </div>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] text-sm">
          <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
            <tr>
              <th className="px-5 py-3">Mã nguồn</th>
              <th className="px-5 py-3">Tên nguồn</th>
              <th className="px-5 py-3">Nhóm nguồn</th>
              <th className="px-5 py-3">Trạng thái</th>
              <th className="px-5 py-3">Lưu</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {sources.length === 0 ? (
              <tr>
                <td className="px-5 py-6 text-center text-zinc-500" colSpan={5}>
                  Chưa có nguồn lead.
                </td>
              </tr>
            ) : (
              sources.map((source) => (
                <tr key={source.id} className="align-middle">
                  <td className="px-5 py-4">
                    <p className="font-mono text-xs font-medium text-zinc-700">
                      {source.source_code}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <form
                      id={`source-${source.id}`}
                      action={updateLeadSourceAction}
                      className="contents"
                    >
                      <input type="hidden" name="source_id" value={source.id} />
                      <input
                        name="source_name"
                        className={inputClass}
                        defaultValue={source.source_name}
                        required
                      />
                    </form>
                  </td>
                  <td className="px-5 py-4">
                    <SourceGroupSelect
                      form={`source-${source.id}`}
                      defaultValue={source.source_group}
                    />
                  </td>
                  <td className="px-5 py-4">
                    <select
                      form={`source-${source.id}`}
                      name="status"
                      className={inputClass}
                      defaultValue={source.status}
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </td>
                  <td className="px-5 py-4">
                    <Button form={`source-${source.id}`} type="submit" size="sm">
                      <Save className="size-4" />
                      Lưu
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
