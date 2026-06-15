import { Route, Save, SquarePlus } from "lucide-react";

import {
  createAdmissionFlowAction,
  updateAdmissionFlowAction,
} from "@/app/settings/actions";
import { Button } from "@/components/ui/button";

export type AdmissionFlowRow = {
  id: string;
  flow_code: string;
  flow_name: string;
  short_description: string;
  owner_department: string;
  main_risk: string;
  sort_order: number;
  status: string;
};

type AdmissionFlowSettingsProps = {
  flows: AdmissionFlowRow[];
  loadError?: string;
};

const inputClass =
  "h-9 w-full rounded-md border border-zinc-300 bg-white px-2 text-sm outline-none transition focus:border-zinc-500 focus:ring-3 focus:ring-zinc-200";

export function AdmissionFlowSettings({
  flows,
  loadError,
}: AdmissionFlowSettingsProps) {
  if (loadError) {
    return (
      <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
        Chưa đọc được bản đồ luồng tuyển sinh. Hãy chạy file SQL{" "}
        <span className="font-mono">database/step34a_admission_flow_master.sql</span>{" "}
        trong Supabase SQL Editor rồi tải lại trang. Chi tiết: {loadError}
      </section>
    );
  }

  const activeCount = flows.filter((flow) => flow.status === "ACTIVE").length;

  return (
    <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-zinc-100">
            <Route className="size-5 text-zinc-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold">
              Bản đồ luồng tuyển sinh master
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Chuẩn hóa 8 luồng tuyển sinh chính để kiểm soát owner, rủi ro,
              pháp chế, COM và hồ sơ. Có {activeCount} luồng active.
            </p>
          </div>
        </div>
      </div>

      <form
        action={createAdmissionFlowAction}
        className="border-b border-zinc-200 bg-zinc-50 p-5"
      >
        <h3 className="text-sm font-semibold">Thêm luồng tuyển sinh mới</h3>
        <div className="mt-4 grid gap-3 xl:grid-cols-[170px_220px_minmax(260px,1fr)_220px_minmax(240px,1fr)_90px_120px_auto]">
          <input
            name="flow_code"
            className={inputClass}
            placeholder="ONLINE_MARKETING"
            required
          />
          <input
            name="flow_name"
            className={inputClass}
            placeholder="Luồng online marketing"
            required
          />
          <input
            name="short_description"
            className={inputClass}
            placeholder="Facebook, Zalo, website..."
            required
          />
          <input
            name="owner_department"
            className={inputClass}
            placeholder="Tuyển sinh + Marketing"
            required
          />
          <input
            name="main_risk"
            className={inputClass}
            placeholder="Trùng lead, thiếu log..."
            required
          />
          <input
            name="sort_order"
            type="number"
            className={inputClass}
            defaultValue={90}
          />
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
        <table className="w-full min-w-[1180px] text-sm">
          <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
            <tr>
              <th className="px-5 py-3">Mã luồng</th>
              <th className="px-5 py-3">Tên luồng</th>
              <th className="px-5 py-3">Mô tả ngắn</th>
              <th className="px-5 py-3">Owner chính</th>
              <th className="px-5 py-3">Rủi ro chính</th>
              <th className="px-5 py-3">Thứ tự</th>
              <th className="px-5 py-3">Trạng thái</th>
              <th className="px-5 py-3">Lưu</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {flows.length === 0 ? (
              <tr>
                <td className="px-5 py-6 text-center text-zinc-500" colSpan={8}>
                  Chưa có luồng tuyển sinh.
                </td>
              </tr>
            ) : (
              flows.map((flow) => (
                <tr key={flow.id} className="align-middle">
                  <td className="px-5 py-4">
                    <p className="font-mono text-xs font-medium text-zinc-700">
                      {flow.flow_code}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <form
                      id={`flow-${flow.id}`}
                      action={updateAdmissionFlowAction}
                      className="contents"
                    >
                      <input type="hidden" name="flow_id" value={flow.id} />
                      <input
                        name="flow_name"
                        className={inputClass}
                        defaultValue={flow.flow_name}
                        required
                      />
                    </form>
                  </td>
                  <td className="px-5 py-4">
                    <input
                      form={`flow-${flow.id}`}
                      name="short_description"
                      className={inputClass}
                      defaultValue={flow.short_description}
                      required
                    />
                  </td>
                  <td className="px-5 py-4">
                    <input
                      form={`flow-${flow.id}`}
                      name="owner_department"
                      className={inputClass}
                      defaultValue={flow.owner_department}
                      required
                    />
                  </td>
                  <td className="px-5 py-4">
                    <input
                      form={`flow-${flow.id}`}
                      name="main_risk"
                      className={inputClass}
                      defaultValue={flow.main_risk}
                      required
                    />
                  </td>
                  <td className="px-5 py-4">
                    <input
                      form={`flow-${flow.id}`}
                      name="sort_order"
                      type="number"
                      className={inputClass}
                      defaultValue={flow.sort_order}
                    />
                  </td>
                  <td className="px-5 py-4">
                    <select
                      form={`flow-${flow.id}`}
                      name="status"
                      className={inputClass}
                      defaultValue={flow.status}
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </td>
                  <td className="px-5 py-4">
                    <Button form={`flow-${flow.id}`} type="submit" size="sm">
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
