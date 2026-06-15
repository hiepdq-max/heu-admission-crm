import { ClipboardCheck, FilePlus2, Save } from "lucide-react";

import {
  createChecklistItemAction,
  updateChecklistItemAction,
} from "@/app/settings/actions";
import { Button } from "@/components/ui/button";

export type ChecklistMasterRow = {
  id: string;
  document_code: string;
  document_name: string;
  is_required: boolean;
  applies_to_program: string | null;
  sort_order: number;
  status: string;
};

type ChecklistSettingsProps = {
  checklists: ChecklistMasterRow[];
};

const inputClass =
  "h-9 w-full rounded-md border border-zinc-300 bg-white px-2 text-sm outline-none transition focus:border-zinc-500 focus:ring-3 focus:ring-zinc-200";

const programOptions = [
  { value: "", label: "Tất cả" },
  { value: "TRUNG_CAP", label: "Trung cấp" },
  { value: "NGAN_HAN", label: "Ngắn hạn" },
  { value: "LIEN_THONG_DAI_HOC", label: "Liên thông đại học" },
];

function ProgramSelect({
  form,
  defaultValue,
}: {
  form?: string;
  defaultValue?: string | null;
}) {
  const hasCustomValue =
    defaultValue &&
    !programOptions.some((option) => option.value === defaultValue);

  return (
    <select
      form={form}
      name="applies_to_program"
      className={inputClass}
      defaultValue={defaultValue ?? ""}
    >
      {programOptions.map((option) => (
        <option key={option.value || "all"} value={option.value}>
          {option.label}
        </option>
      ))}
      {hasCustomValue ? (
        <option value={defaultValue}>{defaultValue}</option>
      ) : null}
    </select>
  );
}

export function ChecklistSettings({ checklists }: ChecklistSettingsProps) {
  const activeCount = checklists.filter((item) => item.status === "ACTIVE").length;
  const requiredCount = checklists.filter((item) => item.is_required).length;

  return (
    <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-zinc-100">
            <ClipboardCheck className="size-5 text-zinc-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold">
              Checklist hồ sơ nhập học master
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Quản lý danh sách giấy tờ bắt buộc dùng trong tab hồ sơ của từng
              lead. Có {activeCount} giấy tờ active, {requiredCount} giấy tờ bắt
              buộc.
            </p>
          </div>
        </div>
      </div>

      <form
        action={createChecklistItemAction}
        className="border-b border-zinc-200 bg-zinc-50 p-5"
      >
        <h3 className="text-sm font-semibold">Thêm giấy tờ mới</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-[170px_minmax(220px,1fr)_150px_110px_130px_auto]">
          <input
            name="document_code"
            className={inputClass}
            placeholder="HEALTH_CERT"
            required
          />
          <input
            name="document_name"
            className={inputClass}
            placeholder="Tên giấy tờ"
            required
          />
          <ProgramSelect />
          <input
            name="sort_order"
            type="number"
            className={inputClass}
            placeholder="110"
            defaultValue={110}
          />
          <select name="status" className={inputClass} defaultValue="ACTIVE">
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-zinc-700">
              <input name="is_required" type="checkbox" className="size-4" />
              Bắt buộc
            </label>
            <Button type="submit" size="sm">
              <FilePlus2 className="size-4" />
              Thêm
            </Button>
          </div>
        </div>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1120px] text-sm">
          <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
            <tr>
              <th className="px-5 py-3">Mã</th>
              <th className="px-5 py-3">Tên giấy tờ</th>
              <th className="px-5 py-3">Áp dụng</th>
              <th className="px-5 py-3">Thứ tự</th>
              <th className="px-5 py-3">Trạng thái</th>
              <th className="px-5 py-3">Bắt buộc</th>
              <th className="px-5 py-3">Lưu</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {checklists.length === 0 ? (
              <tr>
                <td className="px-5 py-6 text-center text-zinc-500" colSpan={7}>
                  Chưa có checklist hồ sơ.
                </td>
              </tr>
            ) : (
              checklists.map((item) => (
                <tr key={item.id} className="align-middle">
                  <td className="px-5 py-4">
                    <p className="font-mono text-xs font-medium text-zinc-700">
                      {item.document_code}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <form
                      id={`checklist-${item.id}`}
                      action={updateChecklistItemAction}
                      className="contents"
                    >
                      <input
                        type="hidden"
                        name="checklist_id"
                        value={item.id}
                      />
                      <input
                        name="document_name"
                        className={inputClass}
                        defaultValue={item.document_name}
                        required
                      />
                    </form>
                  </td>
                  <td className="px-5 py-4">
                    <ProgramSelect
                      form={`checklist-${item.id}`}
                      defaultValue={item.applies_to_program}
                    />
                  </td>
                  <td className="px-5 py-4">
                    <input
                      form={`checklist-${item.id}`}
                      name="sort_order"
                      type="number"
                      className={inputClass}
                      defaultValue={item.sort_order}
                    />
                  </td>
                  <td className="px-5 py-4">
                    <select
                      form={`checklist-${item.id}`}
                      name="status"
                      className={inputClass}
                      defaultValue={item.status}
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </td>
                  <td className="px-5 py-4">
                    <label className="flex items-center gap-2 text-sm text-zinc-700">
                      <input
                        form={`checklist-${item.id}`}
                        name="is_required"
                        type="checkbox"
                        className="size-4"
                        defaultChecked={item.is_required}
                      />
                      Bắt buộc
                    </label>
                  </td>
                  <td className="px-5 py-4">
                    <Button
                      form={`checklist-${item.id}`}
                      type="submit"
                      size="sm"
                    >
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
