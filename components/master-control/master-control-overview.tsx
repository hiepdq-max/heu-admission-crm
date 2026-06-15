import {
  BookOpenCheck,
  Database,
  FileCheck2,
  Gavel,
  Save,
  ShieldCheck,
  SquarePlus,
} from "lucide-react";

import {
  createDataDictionaryFieldAction,
  createDataDictionaryTableAction,
  createDecisionGateAction,
  createLegalRegistryAction,
  createSopRegistryAction,
  updateDecisionGateAction,
  updateLegalRegistryAction,
  updateSopRegistryAction,
} from "@/app/master-control/actions";
import { Button } from "@/components/ui/button";

export type ControlStatus =
  | "DAT"
  | "DAT_TAM_THOI"
  | "CAN_SUA"
  | "CHUA_DU_DIEU_KIEN";

export type LegalRegistryRow = {
  id: string;
  legal_code: string;
  title: string;
  source_type: string;
  issuing_authority: string | null;
  document_no: string | null;
  issued_on: string | null;
  effective_from: string | null;
  effective_to: string | null;
  source_url: string | null;
  file_url: string | null;
  scope_note: string | null;
  owner_department: string | null;
  checker: string | null;
  approver: string | null;
  control_status: ControlStatus;
};

export type SopRegistryRow = {
  id: string;
  sop_code: string;
  sop_name: string;
  module_code: string;
  objective: string | null;
  owner_department: string | null;
  checker_role: string | null;
  approver_role: string | null;
  legal_registry_id: string | null;
  input_note: string | null;
  output_note: string | null;
  risk_note: string | null;
  control_note: string | null;
  file_url: string | null;
  effective_from: string | null;
  control_status: ControlStatus;
};

export type DataDictionaryTableRow = {
  id: string;
  table_code: string;
  table_name: string;
  module_code: string;
  table_type: string;
  data_owner_department: string | null;
  purpose: string | null;
  sensitivity_level: string;
  ai_allowed: boolean;
  control_status: ControlStatus;
};

export type DataDictionaryFieldRow = {
  id: string;
  table_id: string;
  field_code: string;
  field_name: string;
  data_type: string;
  is_required: boolean;
  is_unique: boolean;
  is_sensitive: boolean;
  ai_allowed: boolean;
  validation_rule: string | null;
  note: string | null;
  control_status: ControlStatus;
};

export type DecisionGateRow = {
  id: string;
  gate_code: string;
  gate_name: string;
  gate_type: string;
  entity_type: string;
  entity_code: string;
  owner_department: string | null;
  checker_note: string | null;
  approver_note: string | null;
  evidence_url: string | null;
  decision_status: string;
  due_at: string | null;
  decided_at: string | null;
};

type MasterControlOverviewProps = {
  legalRows: LegalRegistryRow[];
  sopRows: SopRegistryRow[];
  dataTables: DataDictionaryTableRow[];
  dataFields: DataDictionaryFieldRow[];
  decisionGates: DecisionGateRow[];
  canManage: boolean;
  canApprove: boolean;
  loadError?: string;
  message?: string;
  error?: string;
};

const inputClass =
  "h-9 w-full rounded-md border border-zinc-300 bg-white px-2 text-sm outline-none transition focus:border-zinc-500 focus:ring-3 focus:ring-zinc-200";

const textareaClass =
  "min-h-20 w-full rounded-md border border-zinc-300 bg-white px-2 py-2 text-sm outline-none transition focus:border-zinc-500 focus:ring-3 focus:ring-zinc-200";

const controlStatuses: Array<{ value: ControlStatus; label: string }> = [
  { value: "DAT_TAM_THOI", label: "Đạt tạm thời" },
  { value: "DAT", label: "Đạt chính thức" },
  { value: "CAN_SUA", label: "Cần sửa" },
  { value: "CHUA_DU_DIEU_KIEN", label: "Chưa đủ điều kiện" },
];

const legalSourceTypes = [
  "LAW",
  "DECREE",
  "CIRCULAR",
  "REGULATION",
  "CONTRACT",
  "INTERNAL_POLICY",
  "OTHER",
];

const tableTypes = ["MASTER", "TRANSACTION", "REPORT_VIEW", "STAGING", "CONFIG"];
const sensitivityLevels = [
  "PUBLIC",
  "INTERNAL",
  "CONFIDENTIAL",
  "RESTRICTED",
  "SECRET",
];
const decisionStatuses = [
  "DRAFT",
  "PENDING",
  "CHECKED",
  "APPROVED",
  "REJECTED",
  "NEEDS_FIX",
];
const gateTypes = [
  "LEGAL",
  "SOP",
  "DATA",
  "GO_LIVE",
  "AI_AUTOMATION",
  "FINANCE",
  "OTHER",
];

function StatusSelect({
  name = "control_status",
  defaultValue,
  form,
}: {
  name?: string;
  defaultValue: string;
  form?: string;
}) {
  return (
    <select name={name} defaultValue={defaultValue} className={inputClass} form={form}>
      {controlStatuses.map((status) => (
        <option key={status.value} value={status.value}>
          {status.label}
        </option>
      ))}
    </select>
  );
}

function SmallBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-medium text-zinc-600">
      {children}
    </span>
  );
}

export function MasterControlOverview({
  legalRows,
  sopRows,
  dataTables,
  dataFields,
  decisionGates,
  canManage,
  canApprove,
  loadError,
  message,
  error,
}: MasterControlOverviewProps) {
  const legalOptions = legalRows.map((row) => ({
    id: row.id,
    label: `${row.legal_code} - ${row.title}`,
  }));

  if (loadError) {
    return (
      <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
        Chưa đọc được Master Control. Hãy chạy file SQL{" "}
        <span className="font-mono">database/step41_master_control.sql</span>{" "}
        trong Supabase SQL Editor rồi tải lại trang. Chi tiết: {loadError}
      </section>
    );
  }

  return (
    <div className="space-y-6">
      {message ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-200 p-5">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-zinc-100">
              <ShieldCheck className="size-5 text-zinc-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Master Control P0-01</h2>
              <p className="mt-1 text-sm leading-6 text-zinc-500">
                Đây là lớp kiểm soát nền: pháp chế, SOP, data dictionary và
                quyết định duyệt. Các module nghiệp vụ sau này phải đi qua lớp
                này trước khi automation hoặc AI agent được bật production.
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <SmallBadge>{legalRows.length} căn cứ pháp chế</SmallBadge>
            <SmallBadge>{sopRows.length} SOP</SmallBadge>
            <SmallBadge>{dataTables.length} bảng dữ liệu</SmallBadge>
            <SmallBadge>{decisionGates.length} decision gate</SmallBadge>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-200 p-5">
          <div className="flex items-center gap-2">
            <Gavel className="size-4 text-zinc-500" />
            <h2 className="text-base font-semibold">Legal Registry</h2>
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            Ghi căn cứ pháp lý, ngày hiệu lực, nguồn chứng cứ và trạng thái kiểm.
          </p>
        </div>

        {canManage ? (
          <form action={createLegalRegistryAction} className="border-b border-zinc-200 bg-zinc-50 p-5">
            <h3 className="text-sm font-semibold">Thêm căn cứ pháp chế</h3>
            <div className="mt-4 grid gap-3 lg:grid-cols-4">
              <input name="legal_code" className={inputClass} placeholder="LEGAL_ND13_2023" required />
              <input name="title" className={inputClass} placeholder="Tên văn bản/căn cứ" required />
              <select name="source_type" className={inputClass} defaultValue="DECREE">
                {legalSourceTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <input name="document_no" className={inputClass} placeholder="Số/ký hiệu" />
              <input name="issuing_authority" className={inputClass} placeholder="Cơ quan ban hành" />
              <input name="issued_on" type="date" className={inputClass} />
              <input name="effective_from" type="date" className={inputClass} />
              <input name="effective_to" type="date" className={inputClass} />
              <input name="source_url" className={inputClass} placeholder="Link nguồn chính thức" />
              <input name="file_url" className={inputClass} placeholder="Link file nội bộ nếu có" />
              <input name="owner_department" className={inputClass} placeholder="Owner: PHAP_CHE" />
              <StatusSelect defaultValue="DAT_TAM_THOI" />
              <textarea name="scope_note" className={`${textareaClass} lg:col-span-4`} placeholder="Phạm vi áp dụng, điểm cần pháp chế kiểm tra..." />
            </div>
            <div className="mt-4">
              <Button type="submit" size="sm">
                <SquarePlus className="size-4" />
                Thêm căn cứ
              </Button>
            </div>
          </form>
        ) : null}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1300px] text-sm">
            <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
              <tr>
                <th className="px-5 py-3">Mã</th>
                <th className="px-5 py-3">Tên căn cứ</th>
                <th className="px-5 py-3">Loại</th>
                <th className="px-5 py-3">Hiệu lực</th>
                <th className="px-5 py-3">Nguồn</th>
                <th className="px-5 py-3">Trạng thái</th>
                {canManage ? <th className="px-5 py-3">Lưu</th> : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {legalRows.length === 0 ? (
                <tr>
                  <td className="px-5 py-6 text-center text-zinc-500" colSpan={canManage ? 7 : 6}>
                    Chưa có căn cứ pháp chế.
                  </td>
                </tr>
              ) : (
                legalRows.map((legal) => {
                  const formId = `legal-${legal.id}`;

                  return (
                    <tr key={legal.id} className="align-top">
                      <td className="px-5 py-4 font-mono text-xs text-zinc-600">{legal.legal_code}</td>
                      <td className="px-5 py-4">
                        {canManage ? (
                          <form id={formId} action={updateLegalRegistryAction} className="space-y-2">
                            <input type="hidden" name="legal_id" value={legal.id} />
                            <input name="title" className={inputClass} defaultValue={legal.title} required />
                            <textarea name="scope_note" className={textareaClass} defaultValue={legal.scope_note ?? ""} />
                          </form>
                        ) : (
                          <div>
                            <p className="font-medium text-zinc-950">{legal.title}</p>
                            <p className="mt-1 text-xs text-zinc-500">{legal.scope_note}</p>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {canManage ? (
                          <select form={formId} name="source_type" className={inputClass} defaultValue={legal.source_type}>
                            {legalSourceTypes.map((type) => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        ) : legal.source_type}
                      </td>
                      <td className="px-5 py-4">
                        {canManage ? (
                          <div className="grid gap-2">
                            <input form={formId} name="document_no" className={inputClass} defaultValue={legal.document_no ?? ""} placeholder="Số văn bản" />
                            <input form={formId} name="issuing_authority" className={inputClass} defaultValue={legal.issuing_authority ?? ""} placeholder="Cơ quan ban hành" />
                            <input form={formId} name="issued_on" type="date" className={inputClass} defaultValue={legal.issued_on ?? ""} />
                            <input form={formId} name="effective_from" type="date" className={inputClass} defaultValue={legal.effective_from ?? ""} />
                            <input form={formId} name="effective_to" type="date" className={inputClass} defaultValue={legal.effective_to ?? ""} />
                          </div>
                        ) : (
                          <span>{legal.effective_from ?? "Chưa rõ"}</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {canManage ? (
                          <div className="grid gap-2">
                            <input form={formId} name="source_url" className={inputClass} defaultValue={legal.source_url ?? ""} placeholder="Nguồn chính thức" />
                            <input form={formId} name="file_url" className={inputClass} defaultValue={legal.file_url ?? ""} placeholder="File nội bộ" />
                            <input form={formId} name="owner_department" className={inputClass} defaultValue={legal.owner_department ?? ""} placeholder="Owner" />
                            <input form={formId} name="checker" className={inputClass} defaultValue={legal.checker ?? ""} placeholder="Checker" />
                            <input form={formId} name="approver" className={inputClass} defaultValue={legal.approver ?? ""} placeholder="Approver" />
                          </div>
                        ) : (
                          <a className="text-zinc-700 underline" href={legal.source_url ?? "#"}>
                            Nguồn
                          </a>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {canManage ? (
                          <StatusSelect form={formId} defaultValue={legal.control_status} />
                        ) : legal.control_status}
                      </td>
                      {canManage ? (
                        <td className="px-5 py-4">
                          <Button form={formId} type="submit" size="sm">
                            <Save className="size-4" />
                            Lưu
                          </Button>
                        </td>
                      ) : null}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-200 p-5">
          <div className="flex items-center gap-2">
            <BookOpenCheck className="size-4 text-zinc-500" />
            <h2 className="text-base font-semibold">SOP Registry</h2>
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            SOP là điều kiện trước form, dashboard, automation và AI agent.
          </p>
        </div>

        {canManage ? (
          <form action={createSopRegistryAction} className="border-b border-zinc-200 bg-zinc-50 p-5">
            <h3 className="text-sm font-semibold">Thêm SOP</h3>
            <div className="mt-4 grid gap-3 lg:grid-cols-4">
              <input name="sop_code" className={inputClass} placeholder="SOP_TUYEN_SINH_LEAD" required />
              <input name="sop_name" className={inputClass} placeholder="Tên SOP" required />
              <input name="module_code" className={inputClass} placeholder="M05_CRM_TUYEN_SINH" required />
              <select name="legal_registry_id" className={inputClass} defaultValue="">
                <option value="">Chưa gắn legal</option>
                {legalOptions.map((legal) => (
                  <option key={legal.id} value={legal.id}>{legal.label}</option>
                ))}
              </select>
              <input name="owner_department" className={inputClass} placeholder="Owner" />
              <input name="checker_role" className={inputClass} placeholder="Checker" />
              <input name="approver_role" className={inputClass} placeholder="Approver" />
              <StatusSelect defaultValue="DAT_TAM_THOI" />
              <textarea name="objective" className={textareaClass} placeholder="Mục tiêu SOP" />
              <textarea name="input_note" className={textareaClass} placeholder="Input bắt buộc" />
              <textarea name="output_note" className={textareaClass} placeholder="Output/kết quả" />
              <textarea name="risk_note" className={textareaClass} placeholder="Rủi ro chính" />
              <textarea name="control_note" className={`${textareaClass} lg:col-span-4`} placeholder="Control/log/điều kiện kết luận" />
              <input name="file_url" className={inputClass} placeholder="Link SOP nếu có" />
              <input name="effective_from" type="date" className={inputClass} />
            </div>
            <div className="mt-4">
              <Button type="submit" size="sm">
                <SquarePlus className="size-4" />
                Thêm SOP
              </Button>
            </div>
          </form>
        ) : null}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1220px] text-sm">
            <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
              <tr>
                <th className="px-5 py-3">SOP</th>
                <th className="px-5 py-3">Module / Legal</th>
                <th className="px-5 py-3">RACI</th>
                <th className="px-5 py-3">Risk / Control</th>
                <th className="px-5 py-3">Trạng thái</th>
                {canManage ? <th className="px-5 py-3">Lưu</th> : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {sopRows.length === 0 ? (
                <tr>
                  <td className="px-5 py-6 text-center text-zinc-500" colSpan={canManage ? 6 : 5}>
                    Chưa có SOP.
                  </td>
                </tr>
              ) : (
                sopRows.map((sop) => {
                  const formId = `sop-${sop.id}`;
                  const legal = legalRows.find((row) => row.id === sop.legal_registry_id);

                  return (
                    <tr key={sop.id} className="align-top">
                      <td className="px-5 py-4">
                        <p className="font-mono text-xs text-zinc-500">{sop.sop_code}</p>
                        {canManage ? (
                          <form id={formId} action={updateSopRegistryAction} className="mt-2 grid gap-2">
                            <input type="hidden" name="sop_id" value={sop.id} />
                            <input name="sop_name" className={inputClass} defaultValue={sop.sop_name} required />
                            <textarea name="objective" className={textareaClass} defaultValue={sop.objective ?? ""} />
                          </form>
                        ) : (
                          <p className="mt-1 font-medium text-zinc-950">{sop.sop_name}</p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {canManage ? (
                          <div className="grid gap-2">
                            <input form={formId} name="module_code" className={inputClass} defaultValue={sop.module_code} />
                            <select form={formId} name="legal_registry_id" className={inputClass} defaultValue={sop.legal_registry_id ?? ""}>
                              <option value="">Chưa gắn legal</option>
                              {legalOptions.map((item) => (
                                <option key={item.id} value={item.id}>{item.label}</option>
                              ))}
                            </select>
                            <input form={formId} name="file_url" className={inputClass} defaultValue={sop.file_url ?? ""} placeholder="File SOP" />
                            <input form={formId} name="effective_from" type="date" className={inputClass} defaultValue={sop.effective_from ?? ""} />
                          </div>
                        ) : (
                          <span>{sop.module_code} · {legal?.legal_code ?? "Chưa gắn legal"}</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {canManage ? (
                          <div className="grid gap-2">
                            <input form={formId} name="owner_department" className={inputClass} defaultValue={sop.owner_department ?? ""} placeholder="Owner" />
                            <input form={formId} name="checker_role" className={inputClass} defaultValue={sop.checker_role ?? ""} placeholder="Checker" />
                            <input form={formId} name="approver_role" className={inputClass} defaultValue={sop.approver_role ?? ""} placeholder="Approver" />
                            <textarea form={formId} name="input_note" className={textareaClass} defaultValue={sop.input_note ?? ""} placeholder="Input" />
                            <textarea form={formId} name="output_note" className={textareaClass} defaultValue={sop.output_note ?? ""} placeholder="Output" />
                          </div>
                        ) : (
                          <span>{sop.owner_department ?? "Chưa rõ owner"}</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {canManage ? (
                          <div className="grid gap-2">
                            <textarea form={formId} name="risk_note" className={textareaClass} defaultValue={sop.risk_note ?? ""} placeholder="Risk" />
                            <textarea form={formId} name="control_note" className={textareaClass} defaultValue={sop.control_note ?? ""} placeholder="Control" />
                          </div>
                        ) : (
                          <span>{sop.control_note ?? sop.risk_note ?? "Chưa có control"}</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {canManage ? <StatusSelect form={formId} defaultValue={sop.control_status} /> : sop.control_status}
                      </td>
                      {canManage ? (
                        <td className="px-5 py-4">
                          <Button form={formId} type="submit" size="sm">
                            <Save className="size-4" />
                            Lưu
                          </Button>
                        </td>
                      ) : null}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-200 p-5">
          <div className="flex items-center gap-2">
            <Database className="size-4 text-zinc-500" />
            <h2 className="text-base font-semibold">Data Dictionary</h2>
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            Định nghĩa bảng/cột, mức nhạy cảm và AI có được đọc hay không.
          </p>
        </div>

        {canManage ? (
          <div className="grid gap-5 border-b border-zinc-200 bg-zinc-50 p-5 xl:grid-cols-2">
            <form action={createDataDictionaryTableAction}>
              <h3 className="text-sm font-semibold">Thêm bảng dữ liệu</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <input name="table_code" className={inputClass} placeholder="HOC_SINH_MASTER" required />
                <input name="table_name" className={inputClass} placeholder="Tên bảng" required />
                <input name="module_code" className={inputClass} placeholder="M06_CTHSSV" required />
                <select name="table_type" className={inputClass} defaultValue="MASTER">
                  {tableTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
                <input name="data_owner_department" className={inputClass} placeholder="Owner dữ liệu" />
                <select name="sensitivity_level" className={inputClass} defaultValue="INTERNAL">
                  {sensitivityLevels.map((level) => <option key={level} value={level}>{level}</option>)}
                </select>
                <StatusSelect defaultValue="DAT_TAM_THOI" />
                <label className="flex h-9 items-center gap-2 text-sm text-zinc-700">
                  <input name="ai_allowed" type="checkbox" className="size-4" />
                  AI được đọc
                </label>
                <textarea name="purpose" className={`${textareaClass} sm:col-span-2`} placeholder="Mục đích, nguồn dữ liệu, quy tắc kiểm soát" />
              </div>
              <Button type="submit" size="sm" className="mt-4">
                <SquarePlus className="size-4" />
                Thêm bảng
              </Button>
            </form>

            <form action={createDataDictionaryFieldAction}>
              <h3 className="text-sm font-semibold">Thêm cột dữ liệu</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <select name="table_id" className={inputClass} required defaultValue="">
                  <option value="">Chọn bảng</option>
                  {dataTables.map((table) => (
                    <option key={table.id} value={table.id}>{table.table_code}</option>
                  ))}
                </select>
                <input name="field_code" className={inputClass} placeholder="student_name" required />
                <input name="field_name" className={inputClass} placeholder="Tên cột" required />
                <input name="data_type" className={inputClass} placeholder="text / uuid / date..." />
                <StatusSelect defaultValue="DAT_TAM_THOI" />
                <label className="flex h-9 items-center gap-2 text-sm text-zinc-700">
                  <input name="is_required" type="checkbox" className="size-4" />
                  Bắt buộc
                </label>
                <label className="flex h-9 items-center gap-2 text-sm text-zinc-700">
                  <input name="is_sensitive" type="checkbox" className="size-4" />
                  Nhạy cảm
                </label>
                <label className="flex h-9 items-center gap-2 text-sm text-zinc-700">
                  <input name="ai_allowed" type="checkbox" className="size-4" />
                  AI được đọc
                </label>
                <textarea name="validation_rule" className={textareaClass} placeholder="Validation rule" />
                <textarea name="note" className={textareaClass} placeholder="Ghi chú" />
              </div>
              <Button type="submit" size="sm" className="mt-4">
                <SquarePlus className="size-4" />
                Thêm cột
              </Button>
            </form>
          </div>
        ) : null}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] text-sm">
            <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
              <tr>
                <th className="px-5 py-3">Bảng</th>
                <th className="px-5 py-3">Loại / Module</th>
                <th className="px-5 py-3">Nhạy cảm / AI</th>
                <th className="px-5 py-3">Mục đích</th>
                <th className="px-5 py-3">Cột đã khai báo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {dataTables.length === 0 ? (
                <tr>
                  <td className="px-5 py-6 text-center text-zinc-500" colSpan={5}>
                    Chưa có data dictionary.
                  </td>
                </tr>
              ) : (
                dataTables.map((table) => {
                  const fields = dataFields.filter((field) => field.table_id === table.id);

                  return (
                    <tr key={table.id} className="align-top">
                      <td className="px-5 py-4">
                        <p className="font-mono text-xs text-zinc-500">{table.table_code}</p>
                        <p className="mt-1 font-medium text-zinc-950">{table.table_name}</p>
                        <p className="mt-1 text-xs text-zinc-500">{table.control_status}</p>
                      </td>
                      <td className="px-5 py-4">{table.table_type} · {table.module_code}</td>
                      <td className="px-5 py-4">
                        <p>{table.sensitivity_level}</p>
                        <p className="mt-1 text-xs text-zinc-500">
                          AI: {table.ai_allowed ? "Được đọc" : "Không đọc"}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-zinc-600">{table.purpose ?? "Chưa ghi mục đích"}</td>
                      <td className="px-5 py-4">
                        {fields.length === 0 ? (
                          <span className="text-zinc-500">Chưa khai báo cột</span>
                        ) : (
                          <div className="grid gap-2">
                            {fields.map((field) => (
                              <div key={field.id} className="rounded-md border border-zinc-200 bg-zinc-50 p-2">
                                <p className="font-mono text-xs text-zinc-600">
                                  {field.field_code} · {field.data_type}
                                </p>
                                <p className="mt-1 font-medium text-zinc-900">{field.field_name}</p>
                                <p className="mt-1 text-xs text-zinc-500">
                                  {field.is_required ? "Bắt buộc" : "Không bắt buộc"} ·{" "}
                                  {field.is_sensitive ? "Nhạy cảm" : "Không nhạy cảm"} · AI:{" "}
                                  {field.ai_allowed ? "được đọc" : "không đọc"}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-200 p-5">
          <div className="flex items-center gap-2">
            <FileCheck2 className="size-4 text-zinc-500" />
            <h2 className="text-base font-semibold">Decision Gate</h2>
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            Không nâng trạng thái chính thức, go-live hay bật AI khi thiếu gate.
          </p>
        </div>

        {canManage ? (
          <form action={createDecisionGateAction} className="border-b border-zinc-200 bg-zinc-50 p-5">
            <h3 className="text-sm font-semibold">Tạo decision gate</h3>
            <div className="mt-4 grid gap-3 lg:grid-cols-4">
              <input name="gate_code" className={inputClass} placeholder="GATE_P0_01_LEGAL" required />
              <input name="gate_name" className={inputClass} placeholder="Tên gate" required />
              <select name="gate_type" className={inputClass} defaultValue="SOP">
                {gateTypes.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
              <select name="decision_status" className={inputClass} defaultValue="PENDING">
                {decisionStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
              <input name="entity_type" className={inputClass} placeholder="SOP / MODULE / AI_AGENT" required />
              <input name="entity_code" className={inputClass} placeholder="M05_CRM_TUYEN_SINH" required />
              <input name="owner_department" className={inputClass} placeholder="Owner" />
              <input name="due_at" type="datetime-local" className={inputClass} />
              <input name="evidence_url" className={inputClass} placeholder="Link bằng chứng" />
              <textarea name="checker_note" className={textareaClass} placeholder="Ý kiến kiểm" />
              <textarea name="approver_note" className={textareaClass} placeholder="Ý kiến duyệt" />
            </div>
            <Button type="submit" size="sm" className="mt-4">
              <SquarePlus className="size-4" />
              Tạo gate
            </Button>
          </form>
        ) : null}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-sm">
            <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
              <tr>
                <th className="px-5 py-3">Gate</th>
                <th className="px-5 py-3">Đối tượng</th>
                <th className="px-5 py-3">Ghi chú kiểm/duyệt</th>
                <th className="px-5 py-3">Trạng thái</th>
                {canApprove ? <th className="px-5 py-3">Cập nhật</th> : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {decisionGates.length === 0 ? (
                <tr>
                  <td className="px-5 py-6 text-center text-zinc-500" colSpan={canApprove ? 5 : 4}>
                    Chưa có decision gate.
                  </td>
                </tr>
              ) : (
                decisionGates.map((gate) => {
                  const formId = `gate-${gate.id}`;

                  return (
                    <tr key={gate.id} className="align-top">
                      <td className="px-5 py-4">
                        <p className="font-mono text-xs text-zinc-500">{gate.gate_code}</p>
                        <p className="mt-1 font-medium text-zinc-950">{gate.gate_name}</p>
                        <p className="mt-1 text-xs text-zinc-500">{gate.gate_type} · hạn {gate.due_at ?? "chưa có"}</p>
                      </td>
                      <td className="px-5 py-4">
                        {gate.entity_type} · {gate.entity_code}
                        <p className="mt-1 text-xs text-zinc-500">{gate.owner_department}</p>
                      </td>
                      <td className="px-5 py-4">
                        {canApprove ? (
                          <form id={formId} action={updateDecisionGateAction} className="grid gap-2">
                            <input type="hidden" name="gate_id" value={gate.id} />
                            <textarea name="checker_note" className={textareaClass} defaultValue={gate.checker_note ?? ""} placeholder="Checker note" />
                            <textarea name="approver_note" className={textareaClass} defaultValue={gate.approver_note ?? ""} placeholder="Approver note" />
                            <input name="evidence_url" className={inputClass} defaultValue={gate.evidence_url ?? ""} placeholder="Evidence URL" />
                          </form>
                        ) : (
                          <span>{gate.approver_note ?? gate.checker_note ?? "Chưa có ghi chú"}</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {canApprove ? (
                          <select form={formId} name="decision_status" className={inputClass} defaultValue={gate.decision_status}>
                            {decisionStatuses.map((status) => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        ) : gate.decision_status}
                      </td>
                      {canApprove ? (
                        <td className="px-5 py-4">
                          <Button form={formId} type="submit" size="sm">
                            <Save className="size-4" />
                            Lưu
                          </Button>
                        </td>
                      ) : null}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
