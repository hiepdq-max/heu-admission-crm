import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  FileSearch,
  GraduationCap,
  ListChecks,
  RefreshCcw,
  Route,
  UserRoundPlus,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import {
  firstParam,
  getAdmissionWorkspaceContext,
  withAdmissionSegmentParam,
} from "@/lib/workspace";

import {
  assignShortEnrollmentAction,
  convertLeadToShortStudentAction,
  createShortClassAction,
} from "./actions";

type IntakePageProps = {
  searchParams?: Promise<{
    segment?: string | string[];
    error?: string | string[];
    class_created?: string | string[];
    lead_converted?: string | string[];
    enrollment_assigned?: string | string[];
  }>;
};

type OfferingRow = {
  id: string;
  offering_code: string;
  offering_name: string;
  allowed_segment_codes: string[] | null;
  is_enrollment_ready: boolean | null;
  is_finance_ready: boolean | null;
  control_status: string | null;
  status: string | null;
};

type LeadReadinessRow = {
  lead_id: string;
  lead_code: string;
  student_name: string;
  student_phone: string | null;
  lead_status: string | null;
  admission_segment_id: string | null;
  segment_code: string | null;
  segment_name: string | null;
  program_name: string | null;
  major_name: string | null;
  resolved_offering_id: string | null;
  offering_code: string | null;
  offering_name: string | null;
  matching_offering_count: number | null;
  existing_student_id: string | null;
  duplicate_student_id: string | null;
  control_flags: string[] | null;
  readiness_status: string | null;
  can_convert: boolean | null;
  is_fallback?: boolean;
};

type RawShortLeadRow = {
  id: string;
  lead_code: string;
  student_name: string;
  student_phone: string | null;
  parent_phone: string | null;
  status: string | null;
  admission_segment_id: string | null;
  admission_program_id: string | null;
  admission_major_id: string | null;
  admission_offering_id: string | null;
  interested_program: string | null;
  interested_major: string | null;
  created_at: string | null;
};

type ClassReadinessRow = {
  id: string;
  class_code: string;
  class_name: string;
  admission_segment_id: string | null;
  offering_id: string | null;
  offering_code: string | null;
  offering_name: string | null;
  training_location: string | null;
  instructor_name: string | null;
  planned_start_date: string | null;
  capacity: number | null;
  class_status: string | null;
  readiness_status: string | null;
  active_enrollment_count: number | null;
  control_flags: string[] | null;
  updated_at: string | null;
};

type EnrollmentReadinessRow = {
  enrollment_id: string;
  enrollment_code: string;
  student_code: string | null;
  student_name: string;
  student_phone: string | null;
  student_profile_status: string | null;
  class_id: string | null;
  admission_segment_id: string | null;
  offering_id: string | null;
  enrollment_offering_code: string | null;
  enrollment_offering_name: string | null;
  enrollment_status: string | null;
  assignment_status: string | null;
  readiness_status: string | null;
  control_flags: string[] | null;
  updated_at: string | null;
};

const fieldClass =
  "h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-500";
const textAreaClass =
  "min-h-20 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500";

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Chưa có";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
  }).format(new Date(value));
}

function compactFlags(flags: string[] | null | undefined) {
  const flagLabels: Record<string, string> = {
    NOT_SHORT_COURSE_WORKSPACE: "Không thuộc đối tượng ngắn hạn",
    LEAD_NOT_ELIGIBLE:
      "Lead chưa đủ trạng thái để chuyển. Cần Đã nộp hồ sơ, Đủ điều kiện hoặc Đã nhập học.",
    NO_PHONE: "Thiếu số điện thoại học viên/phụ huynh",
    NO_PROGRAM_ID: "Thiếu hệ đào tạo",
    NO_MAJOR_ID: "Thiếu ngành/khoá",
    MULTIPLE_OFFERINGS_NEED_SELECT: "Có nhiều khoá phù hợp, cần chọn đúng khoá",
    NO_OFFERING: "Chưa gắn khoá/ngành chi tiết",
    OFFERING_NOT_ENROLLMENT_READY:
      "Khoá/ngành chưa mở cổng nhập học. Cần kiểm tra pháp lý/học phí.",
    OFFERING_NEEDS_CONTROL: "Khoá/ngành chưa đạt trạng thái kiểm soát",
    ALREADY_CONVERTED: "Lead này đã được chuyển thành học viên",
    DUPLICATE_STUDENT_PHONE: "Trùng số điện thoại với học viên đã có",
    P1_02_VIEW_NOT_RETURNED:
      "Lead chưa qua bảng kiểm P1-02; hãy kiểm tra trạng thái, hệ/ngành và khoá chi tiết.",
  };

  return flags && flags.length > 0
    ? flags.map((flag) => flagLabels[flag] ?? flag).join(", ")
    : "Không có lỗi";
}

function formatLeadStatus(status: string | null | undefined) {
  const labels: Record<string, string> = {
    NEW: "Lead mới",
    ASSIGNED: "Đã phân tư vấn",
    CONTACTED: "Đã liên hệ",
    INTERESTED: "Có quan tâm",
    FOLLOW_UP: "Chăm sóc tiếp",
    DOCUMENT_PENDING: "Chờ hồ sơ",
    DOCUMENT_SUBMITTED: "Đã nộp hồ sơ",
    ELIGIBLE: "Đủ điều kiện",
    ENROLLED: "Đã nhập học",
    LOST: "Không đăng ký",
  };

  return status ? (labels[status] ?? status) : "Chưa rõ trạng thái";
}

function formatReadinessStatus(status: string | null | undefined) {
  const labels: Record<string, string> = {
    READY: "Đủ điều kiện chuyển",
    READY_TO_CONVERT: "Đủ điều kiện chuyển",
    BLOCKED: "Chưa đủ điều kiện",
    NEEDS_APPROVAL: "Cần mở cổng kiểm soát",
    CONVERTED: "Đã chuyển",
    CHUA_DU_DIEU_KIEN: "Chưa đủ điều kiện",
  };

  return status ? (labels[status] ?? status) : "Chưa kiểm tra";
}

function canConvertLead(lead: LeadReadinessRow) {
  return (
    Boolean(lead.can_convert) &&
    (lead.readiness_status === "READY" ||
      lead.readiness_status === "READY_TO_CONVERT")
  );
}

function messageFromParams(params: Awaited<IntakePageProps["searchParams"]>) {
  const error = firstParam(params?.error);

  if (error) {
    return {
      tone: "error",
      text: error,
    };
  }

  if (firstParam(params?.class_created)) {
    return {
      tone: "success",
      text: "Đã tạo lớp ngắn hạn qua cổng kiểm soát.",
    };
  }

  if (firstParam(params?.lead_converted)) {
    return {
      tone: "success",
      text: "Đã chuyển lead thành học viên ngắn hạn và tạo ghi danh nháp.",
    };
  }

  if (firstParam(params?.enrollment_assigned)) {
    return {
      tone: "success",
      text: "Đã gán ghi danh vào lớp. Database đã kiểm tra cùng đối tượng và cùng ngành/khoá.",
    };
  }

  return null;
}

function hiddenContext(segmentId: string | null, returnTo: string) {
  return (
    <>
      {segmentId ? (
        <input type="hidden" name="admission_segment_id" value={segmentId} />
      ) : null}
      <input type="hidden" name="return_to" value={returnTo} />
    </>
  );
}

function classOptionLabel(row: ClassReadinessRow) {
  return [
    row.class_name,
    row.class_code,
    row.offering_name,
    row.training_location,
  ]
    .filter(Boolean)
    .join(" · ");
}

export default async function ShortCourseIntakePage({
  searchParams,
}: IntakePageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const requestedSegmentId = firstParam(resolvedSearchParams.segment);
  const workspace = await getAdmissionWorkspaceContext(
    supabase,
    user.id,
    requestedSegmentId,
  );
  const activeSegmentId = workspace.activeSegmentId;
  const activeSegmentCode = workspace.activeSegment?.segmentCode ?? null;
  const returnTo = withAdmissionSegmentParam(
    "/short-course/intake",
    activeSegmentId,
  );
  const refreshHref = returnTo;
  const message = messageFromParams(resolvedSearchParams);

  const [
    offeringsResult,
    leadsResult,
    rawLeadsResult,
    classesResult,
    enrollmentsResult,
  ] =
    await Promise.all([
      supabase
        .from("admission_offering_catalog")
        .select(
          "id,offering_code,offering_name,allowed_segment_codes,is_enrollment_ready,is_finance_ready,control_status,status",
        )
        .eq("status", "ACTIVE")
        .order("offering_name", { ascending: true })
        .limit(100)
        .returns<OfferingRow[]>(),
      activeSegmentId
        ? supabase
            .from("short_course_lead_to_student_readiness")
            .select(
              "lead_id,lead_code,student_name,student_phone,lead_status,admission_segment_id,segment_code,segment_name,program_name,major_name,resolved_offering_id,offering_code,offering_name,matching_offering_count,existing_student_id,duplicate_student_id,control_flags,readiness_status,can_convert",
            )
            .eq("admission_segment_id", activeSegmentId)
            .order("student_name", { ascending: true })
            .limit(20)
            .returns<LeadReadinessRow[]>()
        : Promise.resolve({ data: [] as LeadReadinessRow[], error: null }),
      activeSegmentId
        ? supabase
            .from("leads")
            .select(
              "id,lead_code,student_name,student_phone,parent_phone,status,admission_segment_id,admission_program_id,admission_major_id,admission_offering_id,interested_program,interested_major,created_at",
            )
            .eq("is_deleted", false)
            .eq("admission_segment_id", activeSegmentId)
            .order("created_at", { ascending: false })
            .limit(20)
            .returns<RawShortLeadRow[]>()
        : Promise.resolve({ data: [] as RawShortLeadRow[], error: null }),
      activeSegmentId
        ? supabase
            .from("short_class_master_readiness")
            .select(
              "id,class_code,class_name,admission_segment_id,offering_id,offering_code,offering_name,training_location,instructor_name,planned_start_date,capacity,class_status,readiness_status,active_enrollment_count,control_flags,updated_at",
            )
            .eq("admission_segment_id", activeSegmentId)
            .order("updated_at", { ascending: false })
            .limit(30)
            .returns<ClassReadinessRow[]>()
        : Promise.resolve({ data: [] as ClassReadinessRow[], error: null }),
      activeSegmentId
        ? supabase
            .from("short_enrollment_class_assignment_readiness")
            .select(
              "enrollment_id,enrollment_code,student_code,student_name,student_phone,student_profile_status,class_id,admission_segment_id,offering_id,enrollment_offering_code,enrollment_offering_name,enrollment_status,assignment_status,readiness_status,control_flags,updated_at",
            )
            .eq("admission_segment_id", activeSegmentId)
            .is("class_id", null)
            .order("updated_at", { ascending: false })
            .limit(20)
            .returns<EnrollmentReadinessRow[]>()
        : Promise.resolve({ data: [] as EnrollmentReadinessRow[], error: null }),
    ]);

  const offerings = (offeringsResult.data ?? []).filter((offering) => {
    if (!activeSegmentCode) {
      return false;
    }

    return (offering.allowed_segment_codes ?? []).includes(activeSegmentCode);
  });
  const leadRows = leadsResult.data ?? [];
  const rawLeadRows = rawLeadsResult.data ?? [];
  const readinessLeadIds = new Set(leadRows.map((lead) => lead.lead_id));
  const fallbackLeadRows: LeadReadinessRow[] = rawLeadRows
    .filter((lead) => !readinessLeadIds.has(lead.id))
    .map((lead) => ({
      lead_id: lead.id,
      lead_code: lead.lead_code,
      student_name: lead.student_name,
      student_phone: lead.student_phone ?? lead.parent_phone,
      lead_status: lead.status,
      admission_segment_id: lead.admission_segment_id,
      segment_code: null,
      segment_name: null,
      program_name: lead.interested_program,
      major_name: lead.interested_major,
      resolved_offering_id: lead.admission_offering_id,
      offering_code: null,
      offering_name: null,
      matching_offering_count: null,
      existing_student_id: null,
      duplicate_student_id: null,
      control_flags: ["P1_02_VIEW_NOT_RETURNED"],
      readiness_status: "CHUA_DU_DIEU_KIEN",
      can_convert: false,
      is_fallback: true,
    }));
  const displayLeadRows = [...leadRows, ...fallbackLeadRows];
  const classRows = classesResult.data ?? [];
  const enrollmentRows = enrollmentsResult.data ?? [];
  const loadError =
    offeringsResult.error?.message ??
    leadsResult.error?.message ??
    rawLeadsResult.error?.message ??
    classesResult.error?.message ??
    enrollmentsResult.error?.message ??
    null;

  return (
    <AppShell
      active="short-course"
      title="P1-20 · Nhập liệu ngắn hạn"
      description={
        workspace.activeSegment
          ? `Tạo dữ liệu thật trong phạm vi: ${workspace.activeSegment.label}.`
          : "Tạo lớp, học viên và ghi danh ngắn hạn qua function kiểm soát."
      }
      workspaceSegmentId={activeSegmentId}
      workspaceReturnTo={refreshHref}
      actions={
        <>
          <Button asChild variant="outline">
            <Link
              href={withAdmissionSegmentParam("/short-course", activeSegmentId)}
            >
              <ArrowLeft className="size-4" />
              Dashboard ngắn hạn
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={refreshHref}>
              <RefreshCcw className="size-4" />
              Tải lại
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/search?q=P1-20">
              <FileSearch className="size-4" />
              Tìm P1-20
            </Link>
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          <div className="flex items-start gap-3">
            <Route className="mt-0.5 size-5 shrink-0" />
            <div>
              <h2 className="font-semibold">Nguyên tắc P1-20</h2>
              <p className="mt-1 leading-6">
                Màn hình này dùng để tạo dữ liệu vận hành thật cho ngắn hạn,
                nhưng không ghi thẳng vào bảng lõi. Mọi thao tác đều đi qua
                function Supabase để kiểm tra phạm vi P0-13, ngành/khoá, trùng
                học viên, lớp, sĩ số và audit log.
              </p>
            </div>
          </div>
        </section>

        {message ? (
          <section
            className={`rounded-lg border p-4 text-sm ${
              message.tone === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            {message.text}
          </section>
        ) : null}

        {loadError ? (
          <section className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            Chưa đọc được dữ liệu P1-20: {loadError}
          </section>
        ) : null}

        {!activeSegmentId ? (
          <section className="rounded-lg border border-zinc-200 bg-white p-6">
            <h2 className="text-lg font-semibold">Chưa chọn đối tượng</h2>
            <p className="mt-2 text-sm text-zinc-600">
              Hãy chọn đối tượng tuyển sinh P0-13 trước. Ví dụ: Ngắn hạn theo
              diện trợ cấp thất nghiệp hoặc Ngắn hạn tuyển sinh tại chỗ HEU.
            </p>
          </section>
        ) : null}

        <section className="rounded-lg border border-zinc-200 bg-white">
          <div className="border-b border-zinc-200 p-5">
            <div className="flex items-center gap-3">
              <GraduationCap className="size-5 text-zinc-500" />
              <div>
                <h2 className="text-lg font-semibold">1. Tạo lớp ngắn hạn</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Lớp phải thuộc đúng đối tượng đang chọn và đúng ngành/khoá.
                </p>
              </div>
            </div>
          </div>

          <form action={createShortClassAction} className="grid gap-4 p-5 lg:grid-cols-2">
            {hiddenContext(activeSegmentId, returnTo)}
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-zinc-700">
                Chương trình/ngành
              </span>
              <select
                name="target_offering_id"
                className={fieldClass}
                required
                disabled={!activeSegmentId || offerings.length === 0}
              >
                <option value="">Chọn chương trình/ngành</option>
                {offerings.map((offering) => (
                  <option key={offering.id} value={offering.id}>
                    {offering.offering_name} · {offering.offering_code}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1.5">
              <span className="text-sm font-medium text-zinc-700">Tên lớp</span>
              <input
                name="class_name"
                className={fieldClass}
                placeholder="VD: Lớp thương mại điện tử TCTN tháng 06/2026"
                required
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-sm font-medium text-zinc-700">
                Địa điểm học
              </span>
              <input
                name="training_location"
                className={fieldClass}
                placeholder="VD: HEU hoặc 786 Kim Giang"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-sm font-medium text-zinc-700">Sĩ số</span>
              <input
                name="capacity"
                type="number"
                min="1"
                className={fieldClass}
                placeholder="VD: 30"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-sm font-medium text-zinc-700">
                Ngày bắt đầu dự kiến
              </span>
              <input
                name="planned_start_date"
                type="date"
                className={fieldClass}
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-sm font-medium text-zinc-700">
                Ngày kết thúc dự kiến
              </span>
              <input
                name="planned_end_date"
                type="date"
                className={fieldClass}
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-sm font-medium text-zinc-700">
                Giảng viên/phụ trách
              </span>
              <input
                name="instructor_name"
                className={fieldClass}
                placeholder="Tên giảng viên hoặc người phụ trách"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-sm font-medium text-zinc-700">
                Ghi chú lịch học
              </span>
              <input
                name="schedule_note"
                className={fieldClass}
                placeholder="VD: Tối thứ 2-4-6, học tại phòng 301"
              />
            </label>

            <label className="space-y-1.5 lg:col-span-2">
              <span className="text-sm font-medium text-zinc-700">
                Ghi chú tạo lớp
              </span>
              <textarea
                name="create_note"
                className={textAreaClass}
                placeholder="Thông tin nội bộ nếu cần"
              />
            </label>

            <div className="lg:col-span-2">
              <Button type="submit" disabled={!activeSegmentId || offerings.length === 0}>
                <GraduationCap className="size-4" />
                Tạo lớp
              </Button>
            </div>
          </form>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white">
          <div className="border-b border-zinc-200 p-5">
            <div className="flex items-center gap-3">
              <UserRoundPlus className="size-5 text-zinc-500" />
              <div>
                <h2 className="text-lg font-semibold">
                  2. Chuyển lead thành học viên
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Chỉ lead đủ điều kiện mới bấm được. Chỗ nào thiếu, cờ kiểm
                  soát sẽ chỉ đúng chỗ đó.
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-zinc-200">
            {displayLeadRows.length === 0 ? (
              <div className="p-6">
                <p className="text-sm text-zinc-500">
                  Chưa có lead ngắn hạn phù hợp trong đối tượng đang chọn. Cần
                  tạo lead trước, sau đó quay lại đây để chuyển lead thành học
                  viên.
                </p>
                <Button asChild className="mt-4">
                  <Link
                    href={withAdmissionSegmentParam(
                      "/leads/new",
                      activeSegmentId,
                    )}
                  >
                    <UserRoundPlus className="size-4" />
                    Tạo lead ngắn hạn
                  </Link>
                </Button>
              </div>
            ) : (
              displayLeadRows.map((lead) => {
                const canConvert = canConvertLead(lead);

                return (
                  <form
                    key={lead.lead_id}
                    action={convertLeadToShortStudentAction}
                    className="grid gap-4 p-5 lg:grid-cols-[1.1fr_1fr_auto]"
                  >
                    {hiddenContext(activeSegmentId, returnTo)}
                    <input
                      type="hidden"
                      name="target_lead_id"
                      value={lead.lead_id}
                    />
                    <div>
                      <p className="font-semibold">{lead.student_name}</p>
                      <p className="mt-1 text-sm text-zinc-500">
                        {lead.lead_code} · {lead.student_phone ?? "Chưa có SĐT"} ·{" "}
                        {formatLeadStatus(lead.lead_status)}
                      </p>
                      <p className="mt-2 text-sm text-zinc-600">
                        {lead.program_name ?? "Chưa rõ hệ"} ·{" "}
                        {lead.major_name ?? "Chưa rõ ngành"} ·{" "}
                        {lead.offering_name ?? "Chưa rõ khoá"}
                      </p>
                      <p
                        className={`mt-2 inline-flex rounded-md px-2 py-1 text-xs ${
                          canConvert
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {formatReadinessStatus(lead.readiness_status)} ·{" "}
                        {compactFlags(lead.control_flags)}
                      </p>
                      {lead.is_fallback ? (
                        <p className="mt-2 text-xs leading-5 text-zinc-500">
                          Lead này đã có trong CRM nhưng chưa đi qua đủ bảng kiểm
                          chuyển học viên. Hãy mở lead để kiểm tra trạng thái,
                          hệ/ngành/khoá trước khi chuyển.
                        </p>
                      ) : null}
                    </div>

                    <div className="space-y-3">
                      <label className="space-y-1.5">
                        <span className="text-sm font-medium text-zinc-700">
                          Chọn ngành/khoá
                        </span>
                        <select
                          name="target_offering_id"
                          className={fieldClass}
                          defaultValue={lead.resolved_offering_id ?? ""}
                        >
                          <option value="">Để hệ thống tự chọn nếu đủ rõ</option>
                          {offerings.map((offering) => (
                            <option key={offering.id} value={offering.id}>
                              {offering.offering_name} · {offering.offering_code}
                            </option>
                          ))}
                        </select>
                      </label>
                      <textarea
                        name="conversion_note"
                        className={textAreaClass}
                        placeholder="Ghi chú chuyển đổi, ví dụ: đã kiểm tra hồ sơ đầu vào."
                      />
                    </div>

                    <div className="flex items-end">
                      <div className="flex flex-wrap items-center gap-2">
                        <Button type="submit" disabled={!canConvert}>
                          <UserRoundPlus className="size-4" />
                          Chuyển
                        </Button>
                        <Button asChild variant="outline">
                          <Link href={`/leads/${lead.lead_id}`}>Mở lead</Link>
                        </Button>
                      </div>
                    </div>
                  </form>
                );
              })
            )}
          </div>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white">
          <div className="border-b border-zinc-200 p-5">
            <div className="flex items-center gap-3">
              <ListChecks className="size-5 text-zinc-500" />
              <div>
                <h2 className="text-lg font-semibold">3. Gán ghi danh vào lớp</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Database sẽ chặn nếu lớp không cùng đối tượng, không cùng
                  ngành/khoá hoặc đã vượt sĩ số.
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-zinc-200">
            {enrollmentRows.length === 0 ? (
              <div className="p-6 text-sm text-zinc-500">
                Chưa có ghi danh nháp/chưa gán lớp trong đối tượng đang chọn.
              </div>
            ) : (
              enrollmentRows.map((enrollment) => {
                const sameOfferingClasses = classRows.filter(
                  (row) =>
                    row.offering_id === enrollment.offering_id &&
                    ["PLANNED", "OPEN", "IN_PROGRESS"].includes(
                      row.class_status ?? "",
                    ),
                );
                const classOptions =
                  sameOfferingClasses.length > 0
                    ? sameOfferingClasses
                    : classRows.filter((row) =>
                        ["PLANNED", "OPEN", "IN_PROGRESS"].includes(
                          row.class_status ?? "",
                        ),
                      );

                return (
                  <form
                    key={enrollment.enrollment_id}
                    action={assignShortEnrollmentAction}
                    className="grid gap-4 p-5 lg:grid-cols-[1.1fr_1fr_auto]"
                  >
                    {hiddenContext(activeSegmentId, returnTo)}
                    <input
                      type="hidden"
                      name="target_enrollment_id"
                      value={enrollment.enrollment_id}
                    />
                    <div>
                      <p className="font-semibold">{enrollment.student_name}</p>
                      <p className="mt-1 text-sm text-zinc-500">
                        {enrollment.enrollment_code} ·{" "}
                        {enrollment.student_code ?? "Chưa có mã học viên"} ·{" "}
                        {enrollment.student_phone ?? "Chưa có SĐT"}
                      </p>
                      <p className="mt-2 text-sm text-zinc-600">
                        {enrollment.enrollment_offering_name ??
                          "Chưa rõ ngành/khoá"}{" "}
                        · {enrollment.enrollment_status ?? "Chưa rõ trạng thái"}
                      </p>
                      <p className="mt-2 inline-flex rounded-md bg-amber-50 px-2 py-1 text-xs text-amber-700">
                        {enrollment.readiness_status ?? "Chưa kiểm tra"} ·{" "}
                        {compactFlags(enrollment.control_flags)}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <label className="space-y-1.5">
                        <span className="text-sm font-medium text-zinc-700">
                          Chọn lớp
                        </span>
                        <select
                          name="target_class_id"
                          className={fieldClass}
                          required
                          disabled={classOptions.length === 0}
                        >
                          <option value="">Chọn lớp cùng ngành/khoá</option>
                          {classOptions.map((row) => (
                            <option key={row.id} value={row.id}>
                              {classOptionLabel(row)}
                            </option>
                          ))}
                        </select>
                      </label>
                      <textarea
                        name="assignment_note"
                        className={textAreaClass}
                        placeholder="Ghi chú gán lớp, ví dụ: học viên đủ điều kiện vào lớp tháng này."
                      />
                    </div>

                    <div className="flex items-end">
                      <Button
                        type="submit"
                        disabled={classOptions.length === 0}
                      >
                        <ListChecks className="size-4" />
                        Gán lớp
                      </Button>
                    </div>
                  </form>
                );
              })
            )}
          </div>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white">
          <div className="border-b border-zinc-200 p-5">
            <h2 className="text-lg font-semibold">Lớp đang có</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Danh sách này giúp kiểm tra nhanh lớp đã tạo trước khi gán ghi
              danh.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-5 py-3">Lớp</th>
                  <th className="px-5 py-3">Ngành/khoá</th>
                  <th className="px-5 py-3">Địa điểm</th>
                  <th className="px-5 py-3">Khai giảng</th>
                  <th className="px-5 py-3">Sĩ số</th>
                  <th className="px-5 py-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {classRows.length === 0 ? (
                  <tr>
                    <td className="px-5 py-8 text-center text-zinc-500" colSpan={6}>
                      Chưa có lớp trong đối tượng đang chọn.
                    </td>
                  </tr>
                ) : (
                  classRows.map((row) => (
                    <tr key={row.id}>
                      <td className="px-5 py-4">
                        <p className="font-medium">{row.class_name}</p>
                        <p className="text-xs text-zinc-500">{row.class_code}</p>
                      </td>
                      <td className="px-5 py-4">
                        {row.offering_name ?? "Chưa rõ"}
                      </td>
                      <td className="px-5 py-4">
                        {row.training_location ?? "Chưa nhập"}
                      </td>
                      <td className="px-5 py-4">
                        {formatDate(row.planned_start_date)}
                      </td>
                      <td className="px-5 py-4">
                        {row.active_enrollment_count ?? 0}/{row.capacity ?? "?"}
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs">
                          {row.class_status ?? "Chưa rõ"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
