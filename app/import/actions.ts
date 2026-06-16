"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type ImportLeadResult = {
  totalRows: number;
  inserted: number;
  skipped: number;
  errors: string[];
  duplicates: string[];
};

export type ImportLeadState = {
  error?: string;
  result?: ImportLeadResult;
};

type LookupRow = {
  id: string;
};

type SourceRow = LookupRow & {
  source_code: string;
  source_name: string;
};

type FlowRow = LookupRow & {
  flow_code: string;
  flow_name: string;
};

type CampaignRow = LookupRow & {
  campaign_code: string;
  campaign_name: string;
};

type PartnerRow = LookupRow & {
  partner_code: string;
  partner_name: string;
};

type SegmentRow = LookupRow & {
  segment_code: string;
  segment_name: string;
};

type SegmentScopeRow = {
  segment_id: string;
};

type PartnerScopeRow = {
  partner_id: string;
};

type ProgramRow = LookupRow & {
  program_code: string;
  program_name: string;
};

type MajorRow = LookupRow & {
  major_code: string;
  major_name: string;
};

type CsvRow = Record<string, string>;

type LeadInsert = {
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
  source_id: string | null;
  flow_id: string | null;
  admission_segment_id: string | null;
  campaign_id: string | null;
  partner_id: string | null;
  assigned_to: string;
  status: string;
  priority: string;
  lost_reason: string | null;
  next_followup_at: string | null;
  note: string | null;
};

const allowedStatuses = new Set([
  "NEW",
  "CONTACTED",
  "INTERESTED",
  "FOLLOW_UP",
  "VISITED",
  "DOCUMENT_PENDING",
]);

const allowedPriorities = new Set(["LOW", "NORMAL", "HIGH", "URGENT"]);

function normalizePhone(value: string | null) {
  return value?.replace(/\D/g, "") || null;
}

function normalizeKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function textValue(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function cell(row: CsvRow, keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    if (value && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
}

function detectDelimiter(header: string) {
  const commaCount = (header.match(/,/g) ?? []).length;
  const semicolonCount = (header.match(/;/g) ?? []).length;
  return semicolonCount > commaCount ? ";" : ",";
}

function parseCsvLine(line: string, delimiter: string) {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === delimiter && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
}

function parseCsv(content: string) {
  const lines = content
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return { rows: [], error: "File CSV cần có dòng tiêu đề và ít nhất 1 dòng dữ liệu." };
  }

  const delimiter = detectDelimiter(lines[0]);
  const headers = parseCsvLine(lines[0], delimiter).map(normalizeKey);

  if (!headers.includes("student_name")) {
    return { rows: [], error: "CSV cần có cột student_name." };
  }

  const rows = lines.slice(1).map((line) => {
    const values = parseCsvLine(line, delimiter);
    return headers.reduce<CsvRow>((record, header, index) => {
      record[header] = values[index]?.trim() ?? "";
      return record;
    }, {});
  });

  return { rows, error: null };
}

function mapByManyKeys<T extends LookupRow>(
  rows: T[] | null,
  keys: (keyof T)[],
) {
  const map = new Map<string, string>();

  for (const row of rows ?? []) {
    for (const key of keys) {
      const value = String(row[key] ?? "").trim();
      if (value) {
        map.set(normalizeKey(value), row.id);
      }
    }
  }

  return map;
}

function lookupId(
  row: CsvRow,
  keys: string[],
  map: Map<string, string>,
  fallback: string | null,
) {
  const rawValue = cell(row, keys);
  if (!rawValue) {
    return fallback;
  }

  return map.get(normalizeKey(rawValue)) ?? fallback;
}

function parseYear(value: string | null) {
  if (!value) {
    return null;
  }

  const year = Number(value);
  return Number.isFinite(year) ? year : null;
}

export async function importLeadsAction(
  _previousState: ImportLeadState,
  formData: FormData,
): Promise<ImportLeadState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const file = formData.get("csv_file");
  const pastedCsv = textValue(formData, "csv_text");
  const csvContent =
    file instanceof File && file.size > 0 ? await file.text() : pastedCsv;

  if (!csvContent) {
    return { error: "Vui lòng chọn file CSV hoặc dán nội dung CSV." };
  }

  const { rows, error: parseError } = parseCsv(csvContent);
  if (parseError) {
    return { error: parseError };
  }

  const defaultSourceId = textValue(formData, "default_source_id");
  const defaultFlowId = textValue(formData, "default_flow_id");
  const defaultAdmissionSegmentId = textValue(
    formData,
    "default_admission_segment_id",
  );
  const defaultCampaignId = textValue(formData, "default_campaign_id");
  const defaultPartnerId = textValue(formData, "default_partner_id");

  if (!defaultAdmissionSegmentId) {
    return {
      error:
        "P0-14 yêu cầu chọn một đối tượng tuyển sinh trước khi import. Hãy chọn workspace ở thanh P0-13 rồi import lại.",
    };
  }

  const [
    { data: currentRoleCode },
    { data: sources },
    { data: flows },
    { data: segments },
    { data: campaigns },
    { data: partners },
    { data: programs },
    { data: majors },
    { data: existingLeads },
    { data: segmentScopeRows },
    { data: partnerScopeRows },
  ] = await Promise.all([
    supabase.rpc("current_user_role_code"),
    supabase
      .from("lead_sources")
      .select("id,source_code,source_name")
      .returns<SourceRow[]>(),
    supabase
      .from("admission_flows")
      .select("id,flow_code,flow_name")
      .returns<FlowRow[]>(),
    supabase
      .from("admission_segments")
      .select("id,segment_code,segment_name")
      .eq("status", "ACTIVE")
      .returns<SegmentRow[]>(),
    supabase
      .from("campaigns")
      .select("id,campaign_code,campaign_name")
      .eq("is_deleted", false)
      .returns<CampaignRow[]>(),
    supabase
      .from("partners")
      .select("id,partner_code,partner_name")
      .eq("is_deleted", false)
      .returns<PartnerRow[]>(),
    supabase
      .from("admission_programs")
      .select("id,program_code,program_name")
      .returns<ProgramRow[]>(),
    supabase
      .from("admission_majors")
      .select("id,major_code,major_name")
      .returns<MajorRow[]>(),
    supabase
      .from("leads")
      .select("lead_code,student_name,student_phone_norm,parent_phone_norm")
      .eq("is_deleted", false),
    supabase
      .from("user_admission_segment_scopes")
      .select("segment_id")
      .eq("user_id", user.id)
      .eq("status", "ACTIVE")
      .returns<SegmentScopeRow[]>(),
    supabase
      .from("user_partner_scopes")
      .select("partner_id")
      .eq("user_id", user.id)
      .eq("status", "ACTIVE")
      .returns<PartnerScopeRow[]>(),
  ]);

  const sourceMap = mapByManyKeys(sources, ["source_code", "source_name"]);
  const flowMap = mapByManyKeys(flows, ["flow_code", "flow_name"]);
  const segmentMap = mapByManyKeys(segments, [
    "id",
    "segment_code",
    "segment_name",
  ]);
  const campaignMap = mapByManyKeys(campaigns, [
    "campaign_code",
    "campaign_name",
  ]);
  const partnerMap = mapByManyKeys(partners, ["partner_code", "partner_name"]);
  const allowedSegmentIds = new Set(
    (segmentScopeRows ?? []).map((scope) => scope.segment_id),
  );
  const allowedPartnerIds = new Set(
    (partnerScopeRows ?? []).map((scope) => scope.partner_id),
  );
  const validSegmentIds = new Set((segments ?? []).map((segment) => segment.id));
  const requiresSegmentScope =
    currentRoleCode !== "ADMIN" && currentRoleCode !== "BGH";

  if (!validSegmentIds.has(defaultAdmissionSegmentId)) {
    return { error: "Đối tượng tuyển sinh mặc định không hợp lệ." };
  }

  const { data: canUseAdmissionWorkspace, error: workspaceError } =
    await supabase.rpc("can_use_admission_workspace", {
      target_segment_id: defaultAdmissionSegmentId,
    });

  if (workspaceError) {
    return {
      error:
        "Chưa kiểm tra được workspace tuyển sinh: " + workspaceError.message,
    };
  }

  if (!canUseAdmissionWorkspace) {
    return {
      error:
        "Bạn không được phân quyền import vào đối tượng tuyển sinh này. Hãy chọn đúng workspace hoặc nhờ quản lý cập nhật phạm vi.",
    };
  }

  if (requiresSegmentScope && allowedSegmentIds.size === 0) {
    return {
      error:
        "Tài khoản này chưa được phân đối tượng tuyển sinh nên chưa thể import lead. Hãy nhờ ADMIN hoặc trưởng phòng phân phạm vi trước.",
    };
  }

  if (allowedPartnerIds.size > 0) {
    if (!defaultPartnerId) {
      return {
        error:
          "Tài khoản này đang bị giới hạn theo đối tác/trung tâm, nên cần chọn Đối tác mặc định trước khi import.",
      };
    }

    if (!allowedPartnerIds.has(defaultPartnerId)) {
      return {
        error:
          "Đối tác mặc định nằm ngoài phạm vi tài khoản này. Hãy chọn đúng đối tác/trung tâm được phân.",
      };
    }
  }

  if (
    requiresSegmentScope &&
    defaultAdmissionSegmentId &&
    !allowedSegmentIds.has(defaultAdmissionSegmentId)
  ) {
    return {
      error:
        "Tài khoản của bạn không được phân quyền import vào đối tượng tuyển sinh đã chọn.",
    };
  }

  const programNameMap = new Map<string, string>();
  const majorNameMap = new Map<string, string>();

  for (const program of programs ?? []) {
    programNameMap.set(normalizeKey(program.program_code), program.program_name);
    programNameMap.set(normalizeKey(program.program_name), program.program_name);
  }

  for (const major of majors ?? []) {
    majorNameMap.set(normalizeKey(major.major_code), major.major_name);
    majorNameMap.set(normalizeKey(major.major_name), major.major_name);
  }
  const existingPhones = new Set<string>();

  for (const lead of existingLeads ?? []) {
    const studentPhone = String(lead.student_phone_norm ?? "");
    const parentPhone = String(lead.parent_phone_norm ?? "");
    if (studentPhone) existingPhones.add(studentPhone);
    if (parentPhone) existingPhones.add(parentPhone);
  }

  const seenPhones = new Set<string>();
  const errors: string[] = [];
  const duplicates: string[] = [];
  const payloads: LeadInsert[] = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const studentName = cell(row, ["student_name", "ho_ten_hoc_sinh"]);
    const studentPhone = cell(row, ["student_phone", "sdt_hoc_sinh"]);
    const parentPhone = cell(row, ["parent_phone", "sdt_phu_huynh"]);
    const studentPhoneNorm = normalizePhone(studentPhone);
    const parentPhoneNorm = normalizePhone(parentPhone);
    const phones = [studentPhoneNorm, parentPhoneNorm].filter(
      (phone): phone is string => Boolean(phone),
    );

    if (!studentName) {
      errors.push(`Dòng ${rowNumber}: thiếu student_name.`);
      return;
    }

    if (phones.length === 0) {
      errors.push(`Dòng ${rowNumber}: cần student_phone hoặc parent_phone.`);
      return;
    }

    const duplicatedPhone = phones.find(
      (phone) => existingPhones.has(phone) || seenPhones.has(phone),
    );

    if (duplicatedPhone) {
      duplicates.push(
        `Dòng ${rowNumber}: bỏ qua vì số ${duplicatedPhone} đã tồn tại hoặc trùng trong file.`,
      );
      return;
    }

    phones.forEach((phone) => seenPhones.add(phone));

    const status = (
      cell(row, ["status", "trang_thai"]) ?? "NEW"
    ).toUpperCase();
    const priority = (
      cell(row, ["priority", "uu_tien"]) ?? "NORMAL"
    ).toUpperCase();
    const nextFollowupAt = cell(row, [
      "next_followup_at",
      "ngay_hen_tiep_theo",
    ]);
    const lostReason = cell(row, ["lost_reason", "ly_do_mat"]);

    if (!allowedStatuses.has(status)) {
      errors.push(`Dòng ${rowNumber}: status ${status} chưa được hỗ trợ khi import.`);
      return;
    }

    if (!allowedPriorities.has(priority)) {
      errors.push(`Dòng ${rowNumber}: priority ${priority} không hợp lệ.`);
      return;
    }

    if (status === "FOLLOW_UP" && !nextFollowupAt) {
      errors.push(`Dòng ${rowNumber}: FOLLOW_UP cần next_followup_at.`);
      return;
    }

    const csvAdmissionSegmentId = lookupId(
      row,
      [
        "admission_segment_id",
        "segment_id",
        "segment_code",
        "segment_name",
        "admission_segment",
        "doi_tuong_tuyen_sinh",
      ],
      segmentMap,
      null,
    );
    const admissionSegmentId = defaultAdmissionSegmentId;

    if (
      csvAdmissionSegmentId &&
      csvAdmissionSegmentId !== defaultAdmissionSegmentId
    ) {
      errors.push(
        `Dòng ${rowNumber}: đối tượng trong CSV khác workspace đang import. Hãy bỏ cột segment hoặc chọn đúng workspace.`,
      );
      return;
    }

    if (!validSegmentIds.has(admissionSegmentId)) {
      errors.push(`Dòng ${rowNumber}: đối tượng tuyển sinh không hợp lệ.`);
      return;
    }

    if (
      requiresSegmentScope &&
      !allowedSegmentIds.has(admissionSegmentId ?? "")
    ) {
      errors.push(
        `Dòng ${rowNumber}: bạn không có quyền import vào đối tượng tuyển sinh này.`,
      );
      return;
    }

    const partnerId = lookupId(
      row,
      ["partner_code", "partner_name", "doi_tac"],
      partnerMap,
      defaultPartnerId,
    );

    if (allowedPartnerIds.size > 0 && !partnerId) {
      errors.push(
        `Dòng ${rowNumber}: tài khoản này cần đối tác/trung tâm trong phạm vi được phân.`,
      );
      return;
    }

    if (partnerId && allowedPartnerIds.size > 0 && !allowedPartnerIds.has(partnerId)) {
      errors.push(
        `Dòng ${rowNumber}: đối tác/trung tâm nằm ngoài phạm vi tài khoản này.`,
      );
      return;
    }

    payloads.push({
      student_name: studentName,
      student_phone: studentPhone,
      student_dob: cell(row, ["student_dob", "ngay_sinh"]),
      student_gender: cell(row, ["student_gender", "gioi_tinh"])?.toUpperCase() ?? null,
      parent_name: cell(row, ["parent_name", "ho_ten_phu_huynh"]),
      parent_phone: parentPhone,
      parent_relationship: cell(row, ["parent_relationship", "quan_he"]),
      current_school: cell(row, ["current_school", "truong_hien_tai"]),
      current_grade: cell(row, ["current_grade", "lop_hien_tai"]),
      graduation_year: parseYear(cell(row, ["graduation_year", "nam_tot_nghiep"])),
      interested_program: (() => {
        const rawProgram = cell(row, [
          "program_code",
          "program_name",
          "interested_program",
          "he_quan_tam",
        ]);
        return rawProgram
          ? programNameMap.get(normalizeKey(rawProgram)) ?? rawProgram
          : null;
      })(),
      interested_major: (() => {
        const rawMajor = cell(row, [
          "major_code",
          "major_name",
          "interested_major",
          "nganh_quan_tam",
        ]);
        return rawMajor ? majorNameMap.get(normalizeKey(rawMajor)) ?? rawMajor : null;
      })(),
      province: cell(row, ["province", "tinh_thanh"]),
      district: cell(row, ["legacy_district", "district", "quan_huyen_cu", "quan_huyen"]),
      ward: cell(row, ["ward", "xa_phuong_dac_khu", "xa_phuong"]),
      source_id: lookupId(
        row,
        ["source_code", "source_name", "nguon_lead"],
        sourceMap,
        defaultSourceId,
      ),
      flow_id: lookupId(
        row,
        ["flow_code", "flow_name", "admission_flow", "luong_tuyen_sinh"],
        flowMap,
        defaultFlowId,
      ),
      admission_segment_id: admissionSegmentId,
      campaign_id: lookupId(
        row,
        ["campaign_code", "campaign_name", "chien_dich"],
        campaignMap,
        defaultCampaignId,
      ),
      partner_id: partnerId,
      assigned_to: user.id,
      status,
      priority,
      lost_reason: lostReason,
      next_followup_at: nextFollowupAt,
      note: cell(row, ["note", "ghi_chu"]),
    });
  });

  if (payloads.length === 0) {
    return {
      result: {
        totalRows: rows.length,
        inserted: 0,
        skipped: rows.length,
        errors,
        duplicates,
      },
    };
  }

  const { error: insertError } = await supabase.from("leads").insert(payloads);

  if (insertError) {
    return { error: "Chưa import được lead: " + insertError.message };
  }

  revalidatePath("/");
  revalidatePath("/leads");
  revalidatePath("/reports");
  revalidatePath("/pipeline");
  revalidatePath("/import");
  revalidatePath("/segments");
  if (defaultAdmissionSegmentId) {
    revalidatePath(`/segments/${defaultAdmissionSegmentId}`);
  }

  return {
    result: {
      totalRows: rows.length,
      inserted: payloads.length,
      skipped: rows.length - payloads.length,
      errors,
      duplicates,
    },
  };
}
