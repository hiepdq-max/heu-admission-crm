import {
  Archive,
  FileStack,
  LockKeyhole,
  Route,
  ShieldCheck,
} from "lucide-react";

import {
  createTchcArchiveMetadataAction,
  createTchcDocumentMetadataAction,
  createTchcHandoverMetadataAction,
} from "@/app/tchc/records-archive/intake/actions";
import { Button } from "@/components/ui/button";

type IntakeField = {
  name: string;
  label: string;
  placeholder: string;
  type?: "text" | "date" | "select";
  options?: string[];
  required?: boolean;
};

type IntakeTemplate = {
  code: string;
  title: string;
  purpose: string;
  icon: typeof FileStack;
  fields: IntakeField[];
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
};

const templates: IntakeTemplate[] = [
  {
    code: "DOCUMENT_METADATA",
    title: "Van ban den/di",
    purpose: "Ghi metadata an toan cho so van ban, khong luu file goc.",
    icon: FileStack,
    action: createTchcDocumentMetadataAction,
    submitLabel: "Luu nhap van ban",
    fields: [
      {
        name: "document_code",
        label: "Ma van ban",
        placeholder: "DOC-2026-0001",
        required: true,
      },
      {
        name: "direction",
        label: "Loai luong",
        placeholder: "Chon loai",
        type: "select",
        options: ["INCOMING", "OUTGOING", "INTERNAL"],
        required: true,
      },
      {
        name: "document_number_safe",
        label: "So/ky hieu an toan",
        placeholder: "Nhap so/ky hieu neu duoc phep hien thi",
      },
      {
        name: "title_safe",
        label: "Tieu de an toan",
        placeholder: "Tom tat khong chua noi dung mat/PII",
        required: true,
      },
      {
        name: "issuing_unit_safe",
        label: "Don vi ban hanh/gui",
        placeholder: "Ten don vi an toan",
      },
      {
        name: "due_date",
        label: "Han xu ly",
        placeholder: "",
        type: "date",
      },
      {
        name: "document_status",
        label: "Trang thai",
        placeholder: "Chon trang thai",
        type: "select",
        options: [
          "DRAFT_INTAKE",
          "ROUTED",
          "IN_PROGRESS",
          "WAITING_RESPONSE",
          "COMPLETED",
          "ARCHIVE_PENDING",
          "ARCHIVED",
          "BLOCKED",
        ],
        required: true,
      },
      {
        name: "evidence_ref_code",
        label: "Ma bang chung kiem soat",
        placeholder: "EVD-TCHC-2026-0001",
      },
    ],
  },
  {
    code: "ARCHIVE_METADATA",
    title: "Ho so luu tru",
    purpose: "Ghi danh muc ho so, hop/ke, thoi han bao quan va trang thai so hoa.",
    icon: Archive,
    action: createTchcArchiveMetadataAction,
    submitLabel: "Luu nhap ho so",
    fields: [
      {
        name: "archive_code",
        label: "Ma ho so",
        placeholder: "ARC-2026-0001",
        required: true,
      },
      {
        name: "archive_title_safe",
        label: "Ten ho so an toan",
        placeholder: "Ten ho so khong chua noi dung nhay cam",
        required: true,
      },
      {
        name: "archive_domain",
        label: "Nhom ho so",
        placeholder: "Chon nhom",
        type: "select",
        options: [
          "CONG_VAN_DEN_DI",
          "HO_SO_PHAP_CHE",
          "HO_SO_NHAN_SU",
          "HO_SO_DAO_TAO",
          "HO_SO_TAI_CHINH",
          "HO_SO_CSVC",
          "HO_SO_KHAC",
        ],
        required: true,
      },
      {
        name: "archive_category",
        label: "Loai ho so",
        placeholder: "QUY_CHE / HOP_DONG / CONG_VAN / ...",
        required: true,
      },
      {
        name: "shelf_code",
        label: "Ke",
        placeholder: "KE-A01",
      },
      {
        name: "box_code",
        label: "Hop",
        placeholder: "BOX-001",
      },
      {
        name: "retention_until",
        label: "Han bao quan",
        placeholder: "",
        type: "date",
      },
      {
        name: "digitization_status",
        label: "Trang thai so hoa",
        placeholder: "Chon trang thai",
        type: "select",
        options: [
          "NOT_DIGITIZED",
          "IN_PROGRESS",
          "DIGITIZED_METADATA_ONLY",
          "DIGITIZED_CONTROLLED_COPY",
          "BLOCKED",
        ],
        required: true,
      },
      {
        name: "evidence_ref_code",
        label: "Ma bang chung kiem soat",
        placeholder: "EVD-TCHC-2026-0001",
      },
    ],
  },
  {
    code: "HANDOVER_METADATA",
    title: "Ban giao/xu ly",
    purpose: "Theo doi ho so/van ban chuyen xu ly giua vi tri va phong ban.",
    icon: Route,
    action: createTchcHandoverMetadataAction,
    submitLabel: "Luu nhap ban giao",
    fields: [
      {
        name: "handover_code",
        label: "Ma ban giao",
        placeholder: "HND-2026-0001",
        required: true,
      },
      {
        name: "item_type",
        label: "Loai doi tuong",
        placeholder: "Chon loai",
        type: "select",
        options: ["DOCUMENT", "ARCHIVE_FILE", "ARCHIVE_BOX"],
        required: true,
      },
      {
        name: "source_item_code",
        label: "Ma nguon",
        placeholder: "DOC-2026-0001 hoac ARC-2026-0001",
        required: true,
      },
      {
        name: "to_department_code",
        label: "Phong ban nhan",
        placeholder: "PHAP_CHE / KHTC / BGH / ...",
      },
      {
        name: "to_position_code",
        label: "Vi tri nhan",
        placeholder: "TCHC_HEAD / PHAP_CHE_HEAD / ...",
      },
      {
        name: "handover_reason",
        label: "Ly do ban giao",
        placeholder: "Xin y kien, xu ly, doi chieu, luu tru...",
        required: true,
      },
      {
        name: "due_date",
        label: "Han phan hoi",
        placeholder: "",
        type: "date",
      },
      {
        name: "handover_status",
        label: "Trang thai",
        placeholder: "Chon trang thai",
        type: "select",
        options: ["DRAFT_ROUTE", "SENT", "RECEIVED", "RETURNED", "OVERDUE", "BLOCKED"],
        required: true,
      },
      {
        name: "evidence_ref_code",
        label: "Ma bang chung kiem soat",
        placeholder: "EVD-TCHC-2026-0001",
      },
    ],
  },
];

type TchcRecordsArchiveIntakeTemplateProps = {
  message?: string | null;
  error?: string | null;
};

function FieldInput({ field }: { field: IntakeField }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-zinc-800">
        {field.label}
        {field.required ? <span className="text-red-600"> *</span> : null}
      </span>
      {field.type === "select" ? (
        <select
          name={field.name}
          required={field.required}
          className="mt-1 h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-800"
          defaultValue=""
        >
          <option value="">{field.placeholder}</option>
          {(field.options ?? []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          name={field.name}
          required={field.required}
          type={field.type ?? "text"}
          placeholder={field.placeholder}
          className="mt-1 h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-800"
        />
      )}
      <span className="mt-1 block text-xs text-zinc-500">{field.name}</span>
    </label>
  );
}

export function TchcRecordsArchiveIntakeTemplate({
  message,
  error,
}: TchcRecordsArchiveIntakeTemplateProps) {
  return (
    <div
      className="space-y-6"
      data-heu-tchc-records-archive-intake-template="TCHC_RECORDS_ARCHIVE_INTAKE_TEMPLATE"
      data-heu-tchc-records-archive-intake-boundary="DRAFT_METADATA_WRITE_ONLY DRAFT_CONTROL NO_RAW_FILE NO_DELETE NO_MOVE NO_APPROVAL NO_PRODUCTION_GO AUDIT_LOG_REQUIRED"
    >
      <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-md border border-amber-100 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
              <LockKeyhole className="h-4 w-4" aria-hidden="true" />
              Draft metadata only
            </div>
            <h2 className="mt-3 text-xl font-semibold text-zinc-950">
              Nhap metadata van thu luu tru
            </h2>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-zinc-600">
              Form nay chi ghi metadata nhap an toan cho van ban den/di, ho so
              luu tru va ban giao xu ly. Khong upload file, khong luu link goc,
              khong phe duyet va khong xu ly huy/di chuyen ho so.
            </p>
          </div>
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-900">
            <div className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                Co submit metadata nhap, nhung chi DRAFT_CONTROL. Can chay
                step119 de mo policy va audit trigger.
              </span>
            </div>
          </div>
        </div>
      </section>

      {message ? (
        <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
          {message}
        </section>
      ) : null}

      {error ? (
        <section className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-900">
          Ma kiem soat: {error}
        </section>
      ) : null}

      {templates.map((template) => {
        const Icon = template.icon;

        return (
          <form
            key={template.code}
            action={template.action}
            className="rounded-lg border border-zinc-200 bg-white shadow-sm"
          >
            <div className="border-b border-zinc-100 p-5">
              <h3 className="flex items-center gap-2 text-base font-semibold text-zinc-950">
                <Icon className="h-4 w-4 text-zinc-500" aria-hidden="true" />
                {template.title}
              </h3>
              <p className="mt-1 text-sm leading-6 text-zinc-600">
                {template.purpose}
              </p>
              <p className="mt-2 text-xs font-medium uppercase text-zinc-500">
                {template.code}
              </p>
            </div>
            <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
              {template.fields.map((field) => (
                <FieldInput key={field.name} field={field} />
              ))}
            </div>
            <div className="flex flex-col gap-3 border-t border-zinc-100 p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-3xl text-sm leading-6 text-zinc-600">
                Submit chi tao ban ghi metadata nhap, control_status =
                DRAFT_CONTROL. Raw file/link goc va noi dung nhay cam bi chan.
              </p>
              <Button type="submit" size="sm">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                {template.submitLabel}
              </Button>
            </div>
          </form>
        );
      })}

      <section className="rounded-lg border border-zinc-200 bg-zinc-50 p-5 text-sm leading-6 text-zinc-700">
        <h3 className="font-semibold text-zinc-950">Dieu kien mo ghi du lieu</h3>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {[
            "PHAP_CHE ky SOP_TCHC_VAN_THU_LUU_TRU va legal gate TCHC-LEGAL-01/02.",
            "TCHC xac nhan ma van ban, ma ho so, ma ke/hop va thoi han bao quan.",
            "IT_DATA chay step119 de mo policy, audit trigger va duplicate guard theo ma.",
            "Audit/BGH xac nhan UAT; PASS_LOCAL khong tu dong thanh GO.",
          ].map((item) => (
            <div key={item} className="flex gap-2">
              <LockKeyhole className="mt-1 h-4 w-4 shrink-0 text-zinc-500" aria-hidden="true" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
