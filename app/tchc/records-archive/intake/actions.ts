"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

const unsafeTextPattern =
  /(https?:\/\/|drive\.google\.com|docs\.google\.com|password|passcode|otp|cccd|cmnd|can cuoc|sao ke|bank statement|so tai khoan|account number)/i;

const documentDirections = new Set(["INCOMING", "OUTGOING", "INTERNAL"]);
const documentStatuses = new Set([
  "DRAFT_INTAKE",
  "ROUTED",
  "IN_PROGRESS",
  "WAITING_RESPONSE",
  "COMPLETED",
  "ARCHIVE_PENDING",
  "ARCHIVED",
  "BLOCKED",
]);
const archiveDomains = new Set([
  "CONG_VAN_DEN_DI",
  "HO_SO_PHAP_CHE",
  "HO_SO_NHAN_SU",
  "HO_SO_DAO_TAO",
  "HO_SO_TAI_CHINH",
  "HO_SO_CSVC",
  "HO_SO_KHAC",
]);
const digitizationStatuses = new Set([
  "NOT_DIGITIZED",
  "IN_PROGRESS",
  "DIGITIZED_METADATA_ONLY",
  "DIGITIZED_CONTROLLED_COPY",
  "BLOCKED",
]);
const handoverItemTypes = new Set(["DOCUMENT", "ARCHIVE_FILE", "ARCHIVE_BOX"]);
const handoverStatuses = new Set([
  "DRAFT_ROUTE",
  "SENT",
  "RECEIVED",
  "RETURNED",
  "OVERDUE",
  "BLOCKED",
]);
const controlledErrorCodes = new Set([
  "unsafe_metadata",
  "invalid_metadata_enum",
  "not_allowed_tchc_records_archive_intake",
  "missing_document_metadata",
  "missing_archive_metadata",
  "missing_handover_metadata",
  "TCHC_RECORDS_ARCHIVE_INTAKE_UNAVAILABLE",
]);

function textValue(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value.length > 0 ? value : null;
}

function codeValue(formData: FormData, key: string) {
  return textValue(formData, key)
    ?.toUpperCase()
    .replace(/[^A-Z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function dateValue(formData: FormData, key: string) {
  const value = textValue(formData, key);

  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

function safeMetadataValue(formData: FormData, key: string) {
  const value = textValue(formData, key);

  if (!value) {
    return null;
  }

  if (unsafeTextPattern.test(value)) {
    redirectWithError("unsafe_metadata");
  }

  return value;
}

function enumValue(
  formData: FormData,
  key: string,
  allowed: Set<string>,
  fallback?: string,
) {
  const value = textValue(formData, key)?.toUpperCase();

  if (!value) {
    return fallback ?? null;
  }

  if (!allowed.has(value)) {
    redirectWithError("invalid_metadata_enum");
  }

  return value;
}

function redirectWithStatus(status: string): never {
  redirect(`/tchc/records-archive/intake?${status}=1`);
}

function redirectWithError(message: string): never {
  const safeMessage = controlledErrorCodes.has(message)
    ? message
    : "TCHC_RECORDS_ARCHIVE_INTAKE_UNAVAILABLE";

  redirect(`/tchc/records-archive/intake?error=${encodeURIComponent(safeMessage)}`);
}

async function requireTchcRecordsArchiveIntake() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: roleCode }, { data: canIntake }] = await Promise.all([
    supabase.rpc("current_user_role_code"),
    supabase.rpc("can_intake_tchc_records_archive"),
  ]);

  if (roleCode !== "ADMIN" && !canIntake) {
    redirectWithError("not_allowed_tchc_records_archive_intake");
  }

  return supabase;
}

async function insertDraftMetadata(
  supabase: SupabaseClient,
  table:
    | "heu_tchc_document_register"
    | "heu_tchc_archive_register"
    | "heu_tchc_archive_handover_register",
  payload: Record<string, string | null>,
) {
  const { error } = await supabase.from(table).insert(payload);

  if (error) {
    redirectWithError("TCHC_RECORDS_ARCHIVE_INTAKE_UNAVAILABLE");
  }

  revalidatePath("/tchc/records-archive");
  revalidatePath("/tchc/records-archive/intake");
}

export async function createTchcDocumentMetadataAction(formData: FormData) {
  const supabase = await requireTchcRecordsArchiveIntake();
  const documentCode = codeValue(formData, "document_code");
  const titleSafe = safeMetadataValue(formData, "title_safe");

  if (!documentCode || !titleSafe) {
    redirectWithError("missing_document_metadata");
  }

  await insertDraftMetadata(supabase, "heu_tchc_document_register", {
    document_code: documentCode,
    direction: enumValue(formData, "direction", documentDirections, "INCOMING"),
    document_number_safe: safeMetadataValue(formData, "document_number_safe"),
    title_safe: titleSafe,
    issuing_unit_safe: safeMetadataValue(formData, "issuing_unit_safe"),
    due_date: dateValue(formData, "due_date"),
    document_status: enumValue(
      formData,
      "document_status",
      documentStatuses,
      "DRAFT_INTAKE",
    ),
    evidence_ref_code: codeValue(formData, "evidence_ref_code") ?? null,
    owner_position_code: "TCHC_VAN_THU_LUU_TRU",
    legal_gate_code: "TCHC-LEGAL-01",
    control_status: "DRAFT_CONTROL",
  });

  redirectWithStatus("document_created");
}

export async function createTchcArchiveMetadataAction(formData: FormData) {
  const supabase = await requireTchcRecordsArchiveIntake();
  const archiveCode = codeValue(formData, "archive_code");
  const archiveTitleSafe = safeMetadataValue(formData, "archive_title_safe");

  if (!archiveCode || !archiveTitleSafe) {
    redirectWithError("missing_archive_metadata");
  }

  await insertDraftMetadata(supabase, "heu_tchc_archive_register", {
    archive_code: archiveCode,
    archive_title_safe: archiveTitleSafe,
    archive_domain: enumValue(formData, "archive_domain", archiveDomains, "CONG_VAN_DEN_DI"),
    archive_category: safeMetadataValue(formData, "archive_category") ?? "DRAFT",
    shelf_code: codeValue(formData, "shelf_code") ?? null,
    box_code: codeValue(formData, "box_code") ?? null,
    folder_code: codeValue(formData, "folder_code") ?? null,
    retention_rule_code: codeValue(formData, "retention_rule_code") ?? null,
    retention_until: dateValue(formData, "retention_until"),
    digitization_status: enumValue(
      formData,
      "digitization_status",
      digitizationStatuses,
      "NOT_DIGITIZED",
    ),
    evidence_ref_code: codeValue(formData, "evidence_ref_code") ?? null,
    owner_position_code: "TCHC_VAN_THU_LUU_TRU",
    legal_gate_code: "TCHC-LEGAL-02",
    control_status: "DRAFT_CONTROL",
  });

  redirectWithStatus("archive_created");
}

export async function createTchcHandoverMetadataAction(formData: FormData) {
  const supabase = await requireTchcRecordsArchiveIntake();
  const handoverCode = codeValue(formData, "handover_code");
  const sourceItemCode = codeValue(formData, "source_item_code");
  const handoverReason = safeMetadataValue(formData, "handover_reason");

  if (!handoverCode || !sourceItemCode || !handoverReason) {
    redirectWithError("missing_handover_metadata");
  }

  await insertDraftMetadata(supabase, "heu_tchc_archive_handover_register", {
    handover_code: handoverCode,
    item_type: enumValue(formData, "item_type", handoverItemTypes, "DOCUMENT"),
    source_item_code: sourceItemCode,
    to_department_code: codeValue(formData, "to_department_code") ?? null,
    to_position_code: codeValue(formData, "to_position_code") ?? null,
    handover_reason: handoverReason,
    due_date: dateValue(formData, "due_date"),
    handover_status: enumValue(
      formData,
      "handover_status",
      handoverStatuses,
      "DRAFT_ROUTE",
    ),
    evidence_ref_code: codeValue(formData, "evidence_ref_code") ?? null,
    from_position_code: "TCHC_VAN_THU_LUU_TRU",
    legal_gate_code: "TCHC-LEGAL-01",
    control_status: "DRAFT_CONTROL",
  });

  redirectWithStatus("handover_created");
}
