import type { ReactNode } from "react";
import {
  CalendarDays,
  CircleDollarSign,
  ExternalLink,
  GraduationCap,
  MapPinned,
  Route,
  Save,
  SquarePlus,
} from "lucide-react";

import {
  createHouLocationAction,
  updateHouLocationAction,
} from "@/app/settings/actions";
import { Button } from "@/components/ui/button";

export type HouProgramRow = {
  id: string;
  program_code: string;
  program_name: string;
  awarding_institution: string;
  coordinating_institution: string;
  delivery_mode: string;
  admission_system_url: string | null;
  lms_url: string | null;
  info_url: string | null;
  contract_code: string | null;
  valid_from: string | null;
  valid_to: string | null;
  tuition_collection_owner: string;
  notes: string | null;
  status: string;
};

export type HouLocationRow = {
  id: string;
  location_code: string;
  location_name: string;
  location_type: string;
  address_line: string;
  ward: string | null;
  district_legacy: string | null;
  province: string | null;
  approval_decision_no: string | null;
  approval_decision_date: string | null;
  valid_from: string | null;
  source_document: string | null;
  approval_file_url: string | null;
  evidence_image_url: string | null;
  evidence_note: string | null;
  notes: string | null;
  status: string;
};

export type HouMajorRow = {
  id: string;
  major_code: string;
  major_name: string;
  sort_order: number;
  status: string;
};

export type HouAdmissionStageRow = {
  id: string;
  stage_code: string;
  stage_name: string;
  sort_order: number;
  is_terminal: boolean;
  status: string;
};

export type HouTermRow = {
  id: string;
  term_code: string;
  term_name: string;
  starts_on: string;
  ends_on: string;
  tuition_collection_starts_on: string | null;
  tuition_collection_ends_on: string | null;
  result_recognition_month: string | null;
  status: string;
};

export type HouFinancialPolicyRow = {
  id: string;
  policy_code: string;
  policy_name: string;
  policy_type: string;
  amount_vnd: number | null;
  hou_share_percent: number | null;
  heu_share_percent: number | null;
  effective_from: string;
  effective_to: string | null;
  payment_condition: string;
  source_document: string | null;
  status: string;
};

type HouFoundationSettingsProps = {
  programs: HouProgramRow[];
  locations: HouLocationRow[];
  majors: HouMajorRow[];
  stages: HouAdmissionStageRow[];
  terms: HouTermRow[];
  policies: HouFinancialPolicyRow[];
  canViewSensitiveFinance: boolean;
  loadError?: string;
};

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Chưa có";
  }

  return new Intl.DateTimeFormat("vi-VN").format(
    new Date(`${value}T00:00:00`),
  );
}

function formatCurrency(value: number | null) {
  if (value === null) {
    return null;
  }

  return `${new Intl.NumberFormat("vi-VN").format(value)}đ`;
}

const inputClass =
  "h-9 w-full rounded-md border border-zinc-300 bg-white px-2 text-sm outline-none transition focus:border-zinc-500 focus:ring-3 focus:ring-zinc-200";

const textareaClass =
  "min-h-20 w-full rounded-md border border-zinc-300 bg-white px-2 py-2 text-sm outline-none transition focus:border-zinc-500 focus:ring-3 focus:ring-zinc-200";

const locationTypeLabels: Record<string, string> = {
  MAIN_CAMPUS: "Cơ sở chính",
  LEARNING_SITE: "Địa điểm học",
  PRACTICE_SITE: "Địa điểm thực hành",
  OTHER: "Khác",
};

const recordStatusLabels: Record<string, string> = {
  ACTIVE: "Đang dùng",
  INACTIVE: "Ngừng dùng",
};

const houAdmissionStageLabels: Record<string, string> = {
  CONSULTING: "Đang tư vấn",
  HOU_SYSTEM_ENTERED: "Đã nhập hệ thống HOU",
  APPLICATION_SUBMITTED: "Đã nộp hồ sơ",
  ADMITTED: "Đã trúng tuyển",
  ENROLLED: "Đã nhập học",
  FIRST_TUITION_CONFIRMED: "Đã xác nhận học phí kỳ đầu",
  STUDYING: "Đang học",
  DROPOUT: "Bỏ học",
  GRADUATED: "Đã tốt nghiệp",
};

const tuitionCollectionOwnerLabels: Record<string, string> = {
  HOU: "HOU thu học phí",
  HEU: "HEU thu học phí",
  PARTNER: "Đối tác thu học phí",
};

function displayFromCode(
  code: string | null | undefined,
  labels: Record<string, string>,
) {
  if (!code) {
    return "Chưa có";
  }

  return labels[code] ?? code.split("_").join(" ");
}

function LocationTypeSelect({
  form,
  defaultValue,
}: {
  form?: string;
  defaultValue?: string | null;
}) {
  return (
    <select
      form={form}
      name="location_type"
      className={inputClass}
      defaultValue={defaultValue ?? "LEARNING_SITE"}
    >
      <option value="MAIN_CAMPUS">Cơ sở chính</option>
      <option value="LEARNING_SITE">Địa điểm học</option>
      <option value="PRACTICE_SITE">Địa điểm thực hành</option>
      <option value="OTHER">Khác</option>
    </select>
  );
}

function Metric({
  label,
  value,
  description,
}: {
  label: string;
  value: string | number;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
      <p className="text-xs font-medium uppercase text-zinc-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-zinc-950">{value}</p>
      <p className="mt-1 text-sm text-zinc-500">{description}</p>
    </div>
  );
}

function ExternalResource({
  href,
  children,
}: {
  href: string | null;
  children: ReactNode;
}) {
  if (!href) {
    return null;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 text-sm font-medium text-zinc-800 underline-offset-4 hover:underline"
    >
      {children}
      <ExternalLink className="size-3.5" />
    </a>
  );
}

export function HouFoundationSettings({
  programs,
  locations,
  majors,
  stages,
  terms,
  policies,
  canViewSensitiveFinance,
  loadError,
}: HouFoundationSettingsProps) {
  if (loadError) {
    return (
      <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
        Chưa đọc được nền dữ liệu HOU. Hãy chạy file SQL{" "}
        <span className="font-mono">database/step35a_hou_foundation.sql</span>{" "}
        trong Supabase SQL Editor rồi tải lại trang. Chi tiết: {loadError}
      </section>
    );
  }

  const activePrograms = programs.filter((program) => program.status === "ACTIVE");
  const activeMajors = majors.filter((major) => major.status === "ACTIVE");
  const activeStages = stages.filter((stage) => stage.status === "ACTIVE");
  const activeTerms = terms.filter((term) => term.status === "ACTIVE");
  const program = activePrograms[0];
  const location = locations.find((item) => item.status === "ACTIVE");
  const supportPolicy = policies.find(
    (policy) => policy.policy_code === "HOU_RECRUITMENT_SUPPORT_2024",
  );
  const sharePolicy = canViewSensitiveFinance
    ? policies.find(
        (policy) => policy.policy_code === "HOU_TRAINING_COOP_2141_2024",
      )
    : null;

  return (
    <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-zinc-100">
            <GraduationCap className="size-5 text-zinc-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold">
              Nền dữ liệu HOU - Liên thông đại học
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Dữ liệu riêng cho chương trình HOU: ngành, địa điểm, lịch học,
              trạng thái xử lý và chính sách tài chính.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 border-b border-zinc-200 p-5 md:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Chương trình"
          value={activePrograms.length}
          description="HOU trong nhóm liên thông đại học"
        />
        <Metric
          label="Ngành HOU"
          value={activeMajors.length}
          description="Danh mục ngành theo CV 353"
        />
        <Metric
          label="Bước HOU"
          value={activeStages.length}
          description="Theo dõi riêng từ tư vấn tới tốt nghiệp"
        />
        <Metric
          label="Kỳ học"
          value={activeTerms.length}
          description="Kế hoạch năm học 2025-2026"
        />
      </div>

      <div className="grid gap-5 border-b border-zinc-200 p-5 xl:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 p-4">
          <div className="flex items-center gap-2">
            <Route className="size-4 text-zinc-500" />
            <h3 className="text-sm font-semibold">Chương trình và hệ thống HOU</h3>
          </div>
          <div className="mt-4 space-y-2 text-sm text-zinc-600">
            <p>
              <span className="font-medium text-zinc-950">
                {program?.program_name ?? "Chưa có chương trình HOU"}
              </span>
            </p>
            <p>Đơn vị cấp bằng: {program?.awarding_institution ?? "Chưa có"}</p>
            <p>
              Đơn vị phối hợp: {program?.coordinating_institution ?? "Chưa có"}
            </p>
            <p>Hình thức: {program?.delivery_mode ?? "Chưa có"}</p>
            <p>
              Hợp đồng: {program?.contract_code ?? "Chưa có"} (
              {formatDate(program?.valid_from)} - {formatDate(program?.valid_to)})
            </p>
            <p>
              Đơn vị thu học phí chính:{" "}
              {displayFromCode(
                program?.tuition_collection_owner,
                tuitionCollectionOwnerLabels,
              )}
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <ExternalResource href={program?.admission_system_url ?? null}>
                Hệ thống tuyển sinh
              </ExternalResource>
              <ExternalResource href={program?.lms_url ?? null}>
                LMS HOU
              </ExternalResource>
              <ExternalResource href={program?.info_url ?? null}>
                Trang thông tin
              </ExternalResource>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 p-4">
          <div className="flex items-center gap-2">
            <MapPinned className="size-4 text-zinc-500" />
            <h3 className="text-sm font-semibold">Địa điểm HEU được phê duyệt</h3>
          </div>
          <div className="mt-4 space-y-2 text-sm text-zinc-600">
            <p>
              <span className="font-medium text-zinc-950">
                {location?.location_name ?? "Chưa có địa điểm"}
              </span>
            </p>
            <p>
              {[location?.address_line, location?.ward, location?.district_legacy, location?.province]
                .filter(Boolean)
                .join(", ") || "Chưa có địa chỉ"}
            </p>
            <p>
              Quyết định: {location?.approval_decision_no ?? "Chưa có"} ngày{" "}
              {formatDate(location?.approval_decision_date)}
            </p>
            <p className="text-zinc-500">
              Quận/huyện được lưu ở trường hồ sơ cũ để khớp quyết định đã ban
              hành, dù hiện nay địa giới hành chính đã bỏ cấp quận/huyện.
            </p>
          </div>
        </div>
      </div>

      <div className="border-b border-zinc-200 p-5">
        <div className="flex items-center gap-2">
          <MapPinned className="size-4 text-zinc-500" />
          <h3 className="text-sm font-semibold">Quản lý địa điểm học HOU</h3>
        </div>
        <p className="mt-1 text-sm text-zinc-500">
          Thêm địa điểm học mới như 786 Kim Giang, lưu link file quyết định hoặc
          ảnh minh chứng. Các địa điểm active sẽ xuất hiện trong form lead HOU.
        </p>

        <form
          action={createHouLocationAction}
          className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4"
        >
          <h4 className="text-sm font-semibold">Thêm địa điểm học</h4>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <input
              name="location_code"
              className={inputClass}
              placeholder="HOU_HEU_786_KIM_GIANG"
              required
            />
            <input
              name="location_name"
              className={inputClass}
              placeholder="HEU - 786 Kim Giang"
              required
            />
            <LocationTypeSelect />
            <input
              name="address_line"
              className={inputClass}
              placeholder="786 Kim Giang"
              required
            />
            <input name="ward" className={inputClass} placeholder="Phường/xã" />
            <input
              name="district_legacy"
              className={inputClass}
              placeholder="Quận/huyện cũ nếu hồ sơ cũ có"
            />
            <input
              name="province"
              className={inputClass}
              placeholder="Thành phố Hà Nội"
            />
            <input name="valid_from" className={inputClass} type="date" />
            <input
              name="approval_decision_no"
              className={inputClass}
              placeholder="Số quyết định/phê duyệt"
            />
            <input
              name="approval_decision_date"
              className={inputClass}
              type="date"
            />
            <select name="status" className={inputClass} defaultValue="ACTIVE">
              <option value="ACTIVE">{recordStatusLabels.ACTIVE}</option>
              <option value="INACTIVE">{recordStatusLabels.INACTIVE}</option>
            </select>
            <Button type="submit" size="sm">
              <SquarePlus className="size-4" />
              Thêm
            </Button>
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <input
              name="source_document"
              className={inputClass}
              placeholder="Tên hồ sơ/minh chứng"
            />
            <input
              name="approval_file_url"
              className={inputClass}
              placeholder="Link file quyết định hoặc Google Drive"
            />
            <input
              name="evidence_image_url"
              className={inputClass}
              placeholder="Link ảnh minh chứng"
            />
            <input
              name="evidence_note"
              className={inputClass}
              placeholder="Ghi chú minh chứng"
            />
          </div>
          <textarea
            name="notes"
            className={`${textareaClass} mt-3`}
            placeholder="Ghi chú thêm về địa điểm, hiệu lực hoặc điều kiện sử dụng."
          />
        </form>

        <div className="mt-5 grid gap-4">
          {locations.map((item) => (
            <form
              key={item.id}
              id={`hou-location-${item.id}`}
              action={updateHouLocationAction}
              className="rounded-lg border border-zinc-200 p-4"
            >
              <input type="hidden" name="location_id" value={item.id} />
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-zinc-950">
                      {item.location_name}
                    </span>
                    <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600">
                      {item.location_code}
                    </span>
                    <span className="rounded-md bg-sky-50 px-2 py-1 text-xs font-medium text-sky-700">
                      {locationTypeLabels[item.location_type] ?? item.location_type}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-zinc-500">
                    {[item.address_line, item.ward, item.district_legacy, item.province]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
                <Button type="submit" size="sm">
                  <Save className="size-4" />
                  Lưu
                </Button>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <input
                  name="location_name"
                  className={inputClass}
                  defaultValue={item.location_name}
                  required
                />
                <LocationTypeSelect
                  form={`hou-location-${item.id}`}
                  defaultValue={item.location_type}
                />
                <input
                  name="address_line"
                  className={inputClass}
                  defaultValue={item.address_line}
                  required
                />
                <input
                  name="ward"
                  className={inputClass}
                  defaultValue={item.ward ?? ""}
                  placeholder="Phường/xã"
                />
                <input
                  name="district_legacy"
                  className={inputClass}
                  defaultValue={item.district_legacy ?? ""}
                  placeholder="Quận/huyện cũ"
                />
                <input
                  name="province"
                  className={inputClass}
                  defaultValue={item.province ?? ""}
                  placeholder="Tỉnh/thành phố"
                />
                <input
                  name="valid_from"
                  type="date"
                  className={inputClass}
                  defaultValue={item.valid_from ?? ""}
                />
                <select
                  name="status"
                  className={inputClass}
                  defaultValue={item.status}
                >
                  <option value="ACTIVE">{recordStatusLabels.ACTIVE}</option>
                  <option value="INACTIVE">{recordStatusLabels.INACTIVE}</option>
                </select>
                <input
                  name="approval_decision_no"
                  className={inputClass}
                  defaultValue={item.approval_decision_no ?? ""}
                  placeholder="Số quyết định/phê duyệt"
                />
                <input
                  name="approval_decision_date"
                  type="date"
                  className={inputClass}
                  defaultValue={item.approval_decision_date ?? ""}
                />
                <input
                  name="source_document"
                  className={inputClass}
                  defaultValue={item.source_document ?? ""}
                  placeholder="Tên hồ sơ/minh chứng"
                />
                <input
                  name="approval_file_url"
                  className={inputClass}
                  defaultValue={item.approval_file_url ?? ""}
                  placeholder="Link file"
                />
                <input
                  name="evidence_image_url"
                  className={inputClass}
                  defaultValue={item.evidence_image_url ?? ""}
                  placeholder="Link ảnh"
                />
                <input
                  name="evidence_note"
                  className={inputClass}
                  defaultValue={item.evidence_note ?? ""}
                  placeholder="Ghi chú minh chứng"
                />
              </div>

              <textarea
                name="notes"
                className={`${textareaClass} mt-3`}
                defaultValue={item.notes ?? ""}
                placeholder="Ghi chú thêm"
              />

              <div className="mt-3 flex flex-wrap gap-3 text-sm">
                <ExternalResource href={item.approval_file_url}>
                  File minh chứng
                </ExternalResource>
                <ExternalResource href={item.evidence_image_url}>
                  Ảnh minh chứng
                </ExternalResource>
              </div>
            </form>
          ))}
        </div>
      </div>

      <div className="grid gap-5 border-b border-zinc-200 p-5 xl:grid-cols-2">
        <div>
          <div className="flex items-center gap-2">
            <CircleDollarSign className="size-4 text-zinc-500" />
            <h3 className="text-sm font-semibold">Chính sách tài chính cần theo dõi</h3>
          </div>
          <div className="mt-4 space-y-3">
            {supportPolicy ? (
              <div className="rounded-lg border border-zinc-200 p-4 text-sm">
                <p className="font-medium text-zinc-950">
                  {supportPolicy.policy_name}
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {formatCurrency(supportPolicy.amount_vnd)}
                </p>
                <p className="mt-2 text-zinc-500">
                  Điều kiện: {supportPolicy.payment_condition}
                </p>
              </div>
            ) : null}

            {sharePolicy ? (
              <div className="rounded-lg border border-zinc-200 p-4 text-sm">
                <p className="font-medium text-zinc-950">
                  {sharePolicy.policy_name}
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  HOU {sharePolicy.hou_share_percent}% / HEU{" "}
                  {sharePolicy.heu_share_percent}%
                </p>
                <p className="mt-2 text-zinc-500">
                  Điều kiện: {sharePolicy.payment_condition}
                </p>
              </div>
            ) : null}

            {!canViewSensitiveFinance ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                Tỷ lệ hợp tác HOU/HEU và các thông tin đối soát nội bộ đã được
                ẩn. Chỉ Admin, Ban giám hiệu hoặc Trưởng phòng tuyển sinh được
                xem phần này.
              </div>
            ) : null}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4 text-zinc-500" />
            <h3 className="text-sm font-semibold">Kỳ học và đợt thu học phí</h3>
          </div>
          <div className="mt-4 overflow-x-auto rounded-lg border border-zinc-200">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-zinc-50 text-left text-xs font-medium uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Kỳ</th>
                  <th className="px-4 py-3">Thời gian học</th>
                  <th className="px-4 py-3">Thu học phí</th>
                  <th className="px-4 py-3">Công nhận KQ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {activeTerms.map((term) => (
                  <tr key={term.id}>
                    <td className="px-4 py-3 font-medium text-zinc-950">
                      {term.term_name}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {formatDate(term.starts_on)} - {formatDate(term.ends_on)}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {formatDate(term.tuition_collection_starts_on)} -{" "}
                      {formatDate(term.tuition_collection_ends_on)}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {term.result_recognition_month ?? "Chưa có"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid gap-5 p-5 xl:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold">Ngành HOU</h3>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {activeMajors.map((major) => (
              <div
                key={major.id}
                className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              >
                <span>{major.major_name}</span>
                <span className="font-mono text-xs text-zinc-500">
                  {major.major_code}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Các bước theo dõi HOU</h3>
          <div className="mt-4 space-y-2">
            {activeStages.map((stage) => (
              <div
                key={stage.id}
                className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              >
                <span>{stage.stage_name}</span>
                <span
                  className="rounded-md bg-zinc-50 px-2 py-1 text-xs font-medium text-zinc-600"
                  title={`Mã nội bộ: ${stage.stage_code}`}
                >
                  {displayFromCode(stage.stage_code, houAdmissionStageLabels)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
