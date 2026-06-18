"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { withAdmissionSegmentParam } from "@/lib/workspace";

function textValue(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value.length > 0 ? value : null;
}

function uuidValue(value: string | null) {
  if (!value) {
    return null;
  }

  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  )
    ? value
    : null;
}

function intValue(value: string | null) {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function safePath(value: string | null, fallback = "/short-course/intake") {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  return value;
}

function redirectWithStatus(formData: FormData, status: string) {
  const segmentId = uuidValue(textValue(formData, "admission_segment_id"));
  const returnTo = safePath(textValue(formData, "return_to"));
  const path = withAdmissionSegmentParam(returnTo, segmentId);
  const joiner = path.includes("?") ? "&" : "?";

  redirect(`${path}${joiner}${status}=1`);
}

function redirectWithError(formData: FormData, message: string) {
  const segmentId = uuidValue(textValue(formData, "admission_segment_id"));
  const returnTo = safePath(textValue(formData, "return_to"));
  const path = withAdmissionSegmentParam(returnTo, segmentId);
  const joiner = path.includes("?") ? "&" : "?";

  redirect(`${path}${joiner}error=${encodeURIComponent(message)}`);
}

async function createAuthedClient(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const segmentId = uuidValue(textValue(formData, "admission_segment_id"));

  if (!segmentId) {
    redirectWithError(formData, "Chưa chọn đối tượng tuyển sinh P0-13.");
  }

  const { data: allowed, error } = await supabase.rpc(
    "can_use_admission_workspace",
    { target_segment_id: segmentId },
  );

  if (error || !allowed) {
    redirectWithError(
      formData,
      error?.message ?? "Tài khoản chưa được phân quyền dùng đối tượng này.",
    );
  }

  return { supabase, segmentId };
}

export async function createShortClassAction(formData: FormData) {
  const { supabase, segmentId } = await createAuthedClient(formData);
  const offeringId = uuidValue(textValue(formData, "target_offering_id"));
  const className = textValue(formData, "class_name");

  if (!offeringId || !className) {
    redirectWithError(formData, "Cần chọn chương trình/ngành và nhập tên lớp.");
  }

  const { error } = await supabase.rpc("create_short_class", {
    target_segment_id: segmentId,
    target_offering_id: offeringId,
    class_name: className,
    training_location: textValue(formData, "training_location"),
    capacity: intValue(textValue(formData, "capacity")),
    planned_start_date: textValue(formData, "planned_start_date"),
    planned_end_date: textValue(formData, "planned_end_date"),
    instructor_name: textValue(formData, "instructor_name"),
    instructor_user_id: null,
    schedule_note: textValue(formData, "schedule_note"),
    create_note: textValue(formData, "create_note"),
  });

  if (error) {
    redirectWithError(formData, error.message);
  }

  revalidatePath("/short-course");
  revalidatePath("/short-course/intake");
  redirectWithStatus(formData, "class_created");
}

export async function convertLeadToShortStudentAction(formData: FormData) {
  const { supabase } = await createAuthedClient(formData);

  const leadId = uuidValue(textValue(formData, "target_lead_id"));
  const offeringId = uuidValue(textValue(formData, "target_offering_id"));

  if (!leadId) {
    redirectWithError(formData, "Chưa chọn lead cần chuyển thành học viên.");
  }

  const { error } = await supabase.rpc("convert_short_course_lead_to_student", {
    target_lead_id: leadId,
    target_offering_id: offeringId,
    conversion_note: textValue(formData, "conversion_note"),
  });

  if (error) {
    redirectWithError(formData, error.message);
  }

  revalidatePath("/short-course");
  revalidatePath("/short-course/intake");
  redirectWithStatus(formData, "lead_converted");
}

export async function assignShortEnrollmentAction(formData: FormData) {
  const { supabase } = await createAuthedClient(formData);

  const enrollmentId = uuidValue(textValue(formData, "target_enrollment_id"));
  const classId = uuidValue(textValue(formData, "target_class_id"));

  if (!enrollmentId || !classId) {
    redirectWithError(formData, "Cần chọn ghi danh và lớp ngắn hạn.");
  }

  const { error } = await supabase.rpc("assign_short_enrollment_to_class", {
    target_enrollment_id: enrollmentId,
    target_class_id: classId,
    p_assignment_note: textValue(formData, "assignment_note"),
  });

  if (error) {
    redirectWithError(formData, error.message);
  }

  revalidatePath("/short-course");
  revalidatePath("/short-course/intake");
  redirectWithStatus(formData, "enrollment_assigned");
}
