import { BookOpenCheck, Save, SquarePlus } from "lucide-react";

import {
  createAdmissionMajorAction,
  createAdmissionProgramAction,
  updateAdmissionMajorAction,
  updateAdmissionProgramAction,
} from "@/app/settings/actions";
import { Button } from "@/components/ui/button";

export type AdmissionProgramRow = {
  id: string;
  program_code: string;
  program_name: string;
  sort_order: number;
  status: string;
};

export type AdmissionMajorRow = {
  id: string;
  major_code: string;
  major_name: string;
  program_id: string | null;
  sort_order: number;
  status: string;
};

type ProgramMajorSettingsProps = {
  programs: AdmissionProgramRow[];
  majors: AdmissionMajorRow[];
  loadError?: string;
};

const inputClass =
  "h-9 w-full rounded-md border border-zinc-300 bg-white px-2 text-sm outline-none transition focus:border-zinc-500 focus:ring-3 focus:ring-zinc-200";

function programName(programs: AdmissionProgramRow[], programId: string | null) {
  return (
    programs.find((program) => program.id === programId)?.program_name ??
    "Chưa gắn hệ"
  );
}

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
    >
      <option value="">Không gắn hệ</option>
      {programs.map((program) => (
        <option key={program.id} value={program.id}>
          {program.program_name}
        </option>
      ))}
    </select>
  );
}

export function ProgramMajorSettings({
  programs,
  majors,
  loadError,
}: ProgramMajorSettingsProps) {
  if (loadError) {
    return (
      <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
        Chưa đọc được master hệ/ngành. Hãy chạy file SQL{" "}
        <span className="font-mono">database/step33_program_major_master.sql</span>{" "}
        trong Supabase SQL Editor rồi tải lại trang. Chi tiết: {loadError}
      </section>
    );
  }

  const activePrograms = programs.filter(
    (program) => program.status === "ACTIVE",
  ).length;
  const activeMajors = majors.filter((major) => major.status === "ACTIVE").length;

  return (
    <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-zinc-100">
            <BookOpenCheck className="size-5 text-zinc-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold">
              Hệ đào tạo và ngành tuyển sinh master
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Chuẩn hóa danh mục để form lead không phải gõ tự do. Có{" "}
              {activePrograms} hệ active và {activeMajors} ngành active.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 border-b border-zinc-200 p-5 xl:grid-cols-2">
        <form action={createAdmissionProgramAction} className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
          <h3 className="text-sm font-semibold">Thêm hệ đào tạo</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-[150px_1fr_90px_120px_auto]">
            <input
              name="program_code"
              className={inputClass}
              placeholder="HE_9_PLUS"
              required
            />
            <input
              name="program_name"
              className={inputClass}
              placeholder="Hệ 9+"
              required
            />
            <input
              name="sort_order"
              type="number"
              className={inputClass}
              defaultValue={10}
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

        <form action={createAdmissionMajorAction} className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
          <h3 className="text-sm font-semibold">Thêm ngành tuyển sinh</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-[150px_1fr_150px_90px_120px_auto]">
            <input
              name="major_code"
              className={inputClass}
              placeholder="AUTO_TECH"
              required
            />
            <input
              name="major_name"
              className={inputClass}
              placeholder="Công nghệ ô tô"
              required
            />
            <ProgramSelect programs={programs} />
            <input
              name="sort_order"
              type="number"
              className={inputClass}
              defaultValue={10}
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
      </div>

      <div className="grid gap-6 p-5 xl:grid-cols-2">
        <div className="overflow-x-auto rounded-lg border border-zinc-200">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3">Mã hệ</th>
                <th className="px-4 py-3">Tên hệ</th>
                <th className="px-4 py-3">Thứ tự</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Lưu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {programs.map((program) => (
                <tr key={program.id}>
                  <td className="px-4 py-3 font-mono text-xs">
                    {program.program_code}
                  </td>
                  <td className="px-4 py-3">
                    <form
                      id={`program-${program.id}`}
                      action={updateAdmissionProgramAction}
                      className="contents"
                    >
                      <input type="hidden" name="program_id" value={program.id} />
                      <input
                        name="program_name"
                        className={inputClass}
                        defaultValue={program.program_name}
                        required
                      />
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      form={`program-${program.id}`}
                      name="sort_order"
                      type="number"
                      className={inputClass}
                      defaultValue={program.sort_order}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <select
                      form={`program-${program.id}`}
                      name="status"
                      className={inputClass}
                      defaultValue={program.status}
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <Button form={`program-${program.id}`} type="submit" size="sm">
                      <Save className="size-4" />
                      Lưu
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="overflow-x-auto rounded-lg border border-zinc-200">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3">Mã ngành</th>
                <th className="px-4 py-3">Tên ngành</th>
                <th className="px-4 py-3">Hệ</th>
                <th className="px-4 py-3">Thứ tự</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Lưu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {majors.map((major) => (
                <tr key={major.id}>
                  <td className="px-4 py-3">
                    <p className="font-mono text-xs">{major.major_code}</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {programName(programs, major.program_id)}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <form
                      id={`major-${major.id}`}
                      action={updateAdmissionMajorAction}
                      className="contents"
                    >
                      <input type="hidden" name="major_id" value={major.id} />
                      <input
                        name="major_name"
                        className={inputClass}
                        defaultValue={major.major_name}
                        required
                      />
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <ProgramSelect
                      form={`major-${major.id}`}
                      programs={programs}
                      defaultValue={major.program_id}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      form={`major-${major.id}`}
                      name="sort_order"
                      type="number"
                      className={inputClass}
                      defaultValue={major.sort_order}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <select
                      form={`major-${major.id}`}
                      name="status"
                      className={inputClass}
                      defaultValue={major.status}
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <Button form={`major-${major.id}`} type="submit" size="sm">
                      <Save className="size-4" />
                      Lưu
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
