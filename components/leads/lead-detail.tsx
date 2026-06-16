import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  FileClock,
  History,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";

type LeadDetailData = {
  id: string;
  lead_code: string;
  student_name: string;
  student_phone: string | null;
  student_dob: string | null;
  student_gender: string | null;
  parent_name: string | null;
  parent_phone: string | null;
  parent_relationship: string | null;
  current_school: string | null;
  current_grade: string | null;
  graduation_year: number | null;
  interested_program: string | null;
  interested_major: string | null;
  province: string | null;
  district: string | null;
  ward: string | null;
  status: string;
  priority: string;
  lost_reason: string | null;
  next_followup_at: string | null;
  note: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  admission_segment_id: string | null;
  hou_program_id: string | null;
  hou_major_id: string | null;
  hou_location_id: string | null;
  hou_stage_id: string | null;
  hou_admission_system_status: string | null;
  hou_admission_system_synced_at: string | null;
  hou_first_term_tuition_confirmed: boolean;
  hou_first_term_tuition_confirmed_at: string | null;
  hou_enrollment_recorded_at: string | null;
};

export type LeadCustomFieldValueRow = {
  id: string;
  field_key: string;
  field_label: string;
  field_type: string;
  field_value: string | null;
  created_at: string;
};

export type MajorLegalTuitionGateRow = {
  id: string;
  nganh_id: string;
  admission_major_id: string | null;
  major_code: string;
  ten_nganh_tu_van: string | null;
  ten_nganh_phap_ly: string | null;
  trinh_do: string | null;
  ma_nganh_nghe: string | null;
  khoa_phu_trach: string | null;
  program_code: string | null;
  program_name: string | null;
  legal_status: string;
  tuition_status: string;
  enrollment_gate: string;
  handover_gate: string;
  finance_gate: string;
  legal_ref: string | null;
  tuition_policy_ref: string | null;
  issue_summary: string | null;
  required_action: string | null;
  owner_department: string;
  checker_department: string;
  approver_role: string;
  control_status: string;
  status: string;
  updated_at: string;
};

type LeadDetailProps = {
  lead: LeadDetailData;
  sourceName: string | null;
  flowName: string | null;
  segmentName: string | null;
  campaignName: string | null;
  partnerName: string | null;
  ownerName: string | null;
  creatorName: string | null;
  lastUpdatedByName: string | null;
  houProgramName: string | null;
  houMajorName: string | null;
  houLocationName: string | null;
  houStageName: string | null;
  activityCount: number;
  documentCount: number;
  customFields: LeadCustomFieldValueRow[];
  customFieldsLoadError?: string;
  majorGate: MajorLegalTuitionGateRow | null;
  majorGateLoadError?: string;
};

const statusLabels: Record<string, string> = {
  NEW: "Lead mới",
  ASSIGNED: "Đã phân tư vấn",
  CONTACTED: "Đã liên hệ",
  INTERESTED: "Có quan tâm",
  FOLLOW_UP: "Cần chăm sóc",
  VISITED: "Đã đến trường",
  DOCUMENT_PENDING: "Chờ hồ sơ",
  DOCUMENT_SUBMITTED: "Đã nộp hồ sơ",
  ELIGIBLE: "Đủ điều kiện",
  ENROLLED: "Đã nhập học",
  LOST: "Không đăng ký",
  DUPLICATE: "Trùng lead",
};

const priorityLabels: Record<string, string> = {
  LOW: "Thấp",
  NORMAL: "Bình thường",
  HIGH: "Cao",
  URGENT: "Khẩn cấp",
};

const gateValueLabels: Record<string, string> = {
  PENDING: "Chờ đối chiếu pháp lý",
  VERIFIED: "Đã đủ pháp lý",
  BLOCKED: "Bị chặn",
  CONFIGURED: "Đã có học phí",
  ALLOW_ENROLLMENT: "Cho nhập học",
  WARN_BEFORE_ENROLLMENT: "Cảnh báo trước nhập học",
  BLOCK_ENROLLMENT: "Chặn nhập học",
  ALLOW_HANDOVER: "Cho bàn giao",
  WARN_BEFORE_HANDOVER: "Cảnh báo trước bàn giao",
  BLOCK_HANDOVER: "Chặn bàn giao",
  ALLOW_FINANCE: "Cho kế toán",
  WARN_BEFORE_FINANCE: "Cảnh báo trước kế toán",
  BLOCK_FINANCE: "Chặn kế toán",
};

function formatDate(value: string | null) {
  if (!value) {
    return "Chưa nhập";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "Chưa đặt";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-zinc-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-zinc-800">
        {value || "Chưa nhập"}
      </p>
    </div>
  );
}

function gateBadgeClass(value: string) {
  if (
    value === "VERIFIED" ||
    value === "CONFIGURED" ||
    value.startsWith("ALLOW_")
  ) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (value === "BLOCKED" || value.startsWith("BLOCK_")) {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-800";
}

function GateBadge({ value }: { value: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium ${gateBadgeClass(value)}`}
    >
      {gateValueLabels[value] ?? value}
    </span>
  );
}

function MajorGatePanel({
  gate,
  loadError,
  interestedMajor,
}: {
  gate: MajorLegalTuitionGateRow | null;
  loadError?: string;
  interestedMajor: string | null;
}) {
  if (loadError) {
    return (
      <section className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <div>
            <h3 className="font-semibold">P0-19 · Chưa đọc được gate ngành</h3>
            <p className="mt-1">
              Hãy chạy SQL{" "}
              <span className="font-mono">
                database/step59_major_legal_tuition_gate.sql
              </span>
              . Chi tiết: {loadError}
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (!gate) {
    return (
      <section className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <div>
            <h3 className="font-semibold">
              P0-19 · Chưa map ngành với gate pháp lý/học phí
            </h3>
            <p className="mt-1">
              Ngành đang chọn: {interestedMajor ?? "Chưa chọn ngành"}. Lead vẫn
              có thể tư vấn, nhưng chưa nên chốt nhập học hoặc bàn giao liên
              phòng cho tới khi ngành được khai báo trong P0-19.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const isReady =
    gate.legal_status === "VERIFIED" &&
    gate.tuition_status === "CONFIGURED" &&
    gate.enrollment_gate === "ALLOW_ENROLLMENT" &&
    gate.handover_gate === "ALLOW_HANDOVER" &&
    gate.finance_gate === "ALLOW_FINANCE";

  return (
    <section
      className={`rounded-md border p-4 ${
        isReady
          ? "border-emerald-200 bg-emerald-50"
          : "border-amber-200 bg-amber-50"
      }`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          {isReady ? (
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
          ) : (
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-700" />
          )}
          <div>
            <h3 className="text-base font-semibold">
              P0-19 · Gate pháp lý + học phí ngành
            </h3>
            <p className="mt-1 text-sm leading-6 text-zinc-700">
              {gate.ten_nganh_tu_van ?? interestedMajor ?? gate.major_code}
              {gate.ten_nganh_phap_ly
                ? ` · Pháp lý: ${gate.ten_nganh_phap_ly}`
                : ""}
            </p>
            <p className="mt-1 text-sm leading-6 text-zinc-600">
              {gate.issue_summary ??
                "Gate này dùng để chặn chốt nhập học/bàn giao khi ngành chưa đủ căn cứ."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 lg:max-w-[520px] lg:justify-end">
          <GateBadge value={gate.legal_status} />
          <GateBadge value={gate.tuition_status} />
          <GateBadge value={gate.enrollment_gate} />
          <GateBadge value={gate.handover_gate} />
          <GateBadge value={gate.finance_gate} />
        </div>
      </div>

      <div className="mt-4 grid gap-4 rounded-md border border-white/70 bg-white/70 p-4 md:grid-cols-2 xl:grid-cols-4">
        <InfoItem label="Căn cứ pháp lý" value={gate.legal_ref} />
        <InfoItem label="Chính sách học phí" value={gate.tuition_policy_ref} />
        <InfoItem label="Owner" value={gate.owner_department} />
        <InfoItem
          label="Checker / Approver"
          value={`${gate.checker_department} · ${gate.approver_role}`}
        />
      </div>

      {gate.required_action ? (
        <p className="mt-3 text-sm leading-6 text-zinc-700">
          Việc cần làm: {gate.required_action}
        </p>
      ) : null}
    </section>
  );
}

function formatCustomFieldValue(field: LeadCustomFieldValueRow) {
  if (!field.field_value) {
    return "Chưa nhập";
  }

  if (field.field_type === "CHECKBOX") {
    return field.field_value === "true" ? "Đã tích chọn" : "Chưa tích chọn";
  }

  return field.field_value;
}

function formatAddress(lead: Pick<LeadDetailData, "province" | "ward" | "district">) {
  const currentAddress = [lead.ward, lead.province].filter(Boolean).join(" / ");

  if (!currentAddress && !lead.district) {
    return "Chưa nhập";
  }

  if (lead.district) {
    return `${currentAddress || "Chưa rõ địa chỉ hiện tại"} · Quận/huyện cũ: ${lead.district}`;
  }

  return currentAddress;
}

const tabs = [
  { label: "Tổng quan", icon: UserRound, active: true },
  { label: "Lịch sử tư vấn", icon: History },
  { label: "Hồ sơ", icon: ClipboardCheck },
  { label: "Follow-up", icon: CalendarClock },
  { label: "Tài chính", icon: CreditCard },
  { label: "Audit log", icon: ShieldCheck },
];

export function LeadDetail({
  lead,
  sourceName,
  flowName,
  segmentName,
  campaignName,
  partnerName,
  ownerName,
  creatorName,
  lastUpdatedByName,
  houProgramName,
  houMajorName,
  houLocationName,
  houStageName,
  activityCount,
  documentCount,
  customFields,
  customFieldsLoadError,
  majorGate,
  majorGateLoadError,
}: LeadDetailProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600">
                {lead.lead_code}
              </span>
              <span className="rounded-md bg-sky-50 px-2 py-1 text-xs font-medium text-sky-700">
                {statusLabels[lead.status] ?? lead.status}
              </span>
              <span className="rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
                Ưu tiên: {priorityLabels[lead.priority] ?? lead.priority}
              </span>
            </div>
            <h2 className="mt-4 text-2xl font-semibold tracking-normal">
              {lead.student_name}
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              Phụ trách: {ownerName ?? "Chưa phân công"} · Nguồn:{" "}
              {sourceName ?? "Chưa rõ nguồn"} · Luồng:{" "}
              {flowName ?? "Chưa phân loại"}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[520px]">
            <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
              <p className="text-xs text-zinc-500">Activity</p>
              <p className="mt-1 text-xl font-semibold">{activityCount}</p>
            </div>
            <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
              <p className="text-xs text-zinc-500">Hồ sơ</p>
              <p className="mt-1 text-xl font-semibold">{documentCount}</p>
            </div>
            <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
              <p className="text-xs text-zinc-500">Follow-up</p>
              <p className="mt-1 text-sm font-semibold">
                {formatDateTime(lead.next_followup_at)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
        <div className="flex gap-1 overflow-x-auto border-b border-zinc-200 p-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <button
                key={tab.label}
                className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium ${
                  tab.active
                    ? "bg-zinc-950 text-white"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
                }`}
                type="button"
              >
                <Icon className="size-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="grid gap-6 p-5 xl:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <section>
              <h3 className="text-base font-semibold">Thông tin học sinh</h3>
              <div className="mt-4 grid gap-4 rounded-md border border-zinc-200 p-4 md:grid-cols-2 xl:grid-cols-3">
                <InfoItem label="Họ tên" value={lead.student_name} />
                <InfoItem label="SĐT học sinh" value={lead.student_phone} />
                <InfoItem label="Ngày sinh" value={formatDate(lead.student_dob)} />
                <InfoItem label="Giới tính" value={lead.student_gender} />
                <InfoItem label="Trường hiện tại" value={lead.current_school} />
                <InfoItem label="Lớp" value={lead.current_grade} />
                <InfoItem label="Năm tốt nghiệp" value={lead.graduation_year} />
              </div>
            </section>

            <section>
              <h3 className="text-base font-semibold">Phụ huynh và nhu cầu</h3>
              <div className="mt-4 grid gap-4 rounded-md border border-zinc-200 p-4 md:grid-cols-2 xl:grid-cols-3">
                <InfoItem label="Phụ huynh" value={lead.parent_name} />
                <InfoItem label="SĐT phụ huynh" value={lead.parent_phone} />
                <InfoItem label="Quan hệ" value={lead.parent_relationship} />
                <InfoItem label="Hệ đào tạo" value={lead.interested_program} />
                <InfoItem label="Ngành quan tâm" value={lead.interested_major} />
                <InfoItem
                  label="Địa bàn hiện tại"
                  value={formatAddress(lead)}
                />
              </div>
            </section>

            <MajorGatePanel
              gate={majorGate}
              loadError={majorGateLoadError}
              interestedMajor={lead.interested_major}
            />

            {customFieldsLoadError ? (
              <section className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                Chưa đọc được thông tin tùy biến P0-18: {customFieldsLoadError}
              </section>
            ) : null}

            {customFields.length > 0 ? (
              <section>
                <h3 className="text-base font-semibold">
                  Thông tin tùy biến theo P0-17/P0-18
                </h3>
                <div className="mt-4 grid gap-4 rounded-md border border-zinc-200 p-4 md:grid-cols-2 xl:grid-cols-3">
                  {customFields.map((field) => (
                    <InfoItem
                      key={field.id}
                      label={field.field_label}
                      value={formatCustomFieldValue(field)}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            <section>
              <h3 className="text-base font-semibold">Theo dõi HOU</h3>
              <div className="mt-4 grid gap-4 rounded-md border border-zinc-200 p-4 md:grid-cols-2 xl:grid-cols-3">
                <InfoItem label="Chương trình HOU" value={houProgramName} />
                <InfoItem label="Ngành HOU" value={houMajorName} />
                <InfoItem label="Bước HOU" value={houStageName} />
                <InfoItem label="Địa điểm HOU" value={houLocationName} />
                <InfoItem
                  label="Trạng thái hệ thống HOU"
                  value={lead.hou_admission_system_status}
                />
                <InfoItem
                  label="Đã nhập/cập nhật HOU"
                  value={formatDateTime(lead.hou_admission_system_synced_at)}
                />
                <InfoItem
                  label="Học phí kỳ đầu"
                  value={
                    lead.hou_first_term_tuition_confirmed
                      ? "Đã xác nhận"
                      : "Chưa xác nhận"
                  }
                />
                <InfoItem
                  label="Thời điểm xác nhận học phí"
                  value={formatDateTime(lead.hou_first_term_tuition_confirmed_at)}
                />
                <InfoItem
                  label="Ghi nhận nhập học HOU"
                  value={formatDateTime(lead.hou_enrollment_recorded_at)}
                />
              </div>
            </section>

            <section>
              <h3 className="text-base font-semibold">Ghi chú tư vấn</h3>
              <div className="mt-4 rounded-md border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-sm leading-6 text-zinc-700">
                  {lead.note || "Chưa có ghi chú."}
                </p>
              </div>
            </section>
          </div>

          <aside className="space-y-4">
            <div className="rounded-md border border-zinc-200 p-4">
              <h3 className="text-sm font-semibold">Nguồn lead</h3>
              <div className="mt-4 space-y-3">
                <InfoItem label="Nguồn" value={sourceName} />
                <InfoItem label="Luồng tuyển sinh" value={flowName} />
                <InfoItem label="Đối tượng tuyển sinh" value={segmentName} />
                <InfoItem label="Chiến dịch" value={campaignName} />
                <InfoItem label="Đối tác / CTV" value={partnerName} />
              </div>
            </div>

            <div className="rounded-md border border-zinc-200 p-4">
              <h3 className="text-sm font-semibold">Mốc hệ thống</h3>
              <div className="mt-4 space-y-3">
                <InfoItem label="Người tạo lead" value={creatorName} />
                <InfoItem
                  label="Người cập nhật gần nhất"
                  value={lastUpdatedByName}
                />
                <InfoItem label="Ngày tạo" value={formatDateTime(lead.created_at)} />
                <InfoItem
                  label="Cập nhật gần nhất"
                  value={formatDateTime(lead.updated_at)}
                />
                <InfoItem label="Lý do mất" value={lead.lost_reason} />
              </div>
            </div>

            <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
              <div className="flex items-start gap-3">
                <FileClock className="mt-0.5 size-4 text-zinc-500" />
                <p className="text-sm leading-6 text-zinc-600">
                  Các tab Lịch sử tư vấn, Hồ sơ, Follow-up, Tài chính và Audit
                  log đã có khung. Những tab này sẽ được nối dữ liệu thật ở các
                  bước tiếp theo.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold">Liên hệ nhanh</h3>
        <div className="mt-4 flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-2 rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-700">
            <Phone className="size-4 text-zinc-500" />
            Học sinh: {lead.student_phone ?? "Chưa có SĐT"}
          </span>
          <span className="inline-flex items-center gap-2 rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-700">
            <Phone className="size-4 text-zinc-500" />
            Phụ huynh: {lead.parent_phone ?? "Chưa có SĐT"}
          </span>
        </div>
      </section>
    </div>
  );
}
