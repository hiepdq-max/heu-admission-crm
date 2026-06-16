import type { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export type AdmissionFormFieldConfig = {
  id: string;
  segment_id: string;
  field_key: string;
  field_label: string;
  field_group: string;
  field_type: string;
  is_visible: boolean;
  is_required: boolean;
  option_source: string;
  placeholder: string | null;
  help_text: string | null;
  validation_rule: string | null;
  sort_order: number;
  status: string;
};

export type LeadDynamicField = AdmissionFormFieldConfig & {
  form_name: string;
  is_custom: boolean;
};

const fieldKeyToFormName: Record<string, string> = {
  student_name: "student_name",
  phone: "student_phone",
  student_phone: "student_phone",
  student_dob: "student_dob",
  student_gender: "student_gender",
  parent_name: "parent_name",
  parent_phone: "parent_phone",
  parent_relationship: "parent_relationship",
  current_school: "current_school",
  current_grade: "current_grade",
  graduation_year: "graduation_year",
  lead_source_id: "source_id",
  source_id: "source_id",
  flow_id: "flow_id",
  campaign_id: "campaign_id",
  partner_id: "partner_id",
  interested_program: "interested_program_id",
  interested_major: "interested_major_id",
  province: "province",
  ward: "ward",
  legacy_district: "district",
  district: "district",
  note: "note",
  hou_program_id: "hou_program_id",
  hou_major_id: "hou_major_id",
  hou_location_id: "hou_location_id",
  hou_stage_id: "hou_stage_id",
  first_tuition_confirmed: "hou_first_term_tuition_confirmed",
  hou_first_term_tuition_confirmed: "hou_first_term_tuition_confirmed",
};

export function customFieldFormName(fieldKey: string) {
  return `custom_field__${fieldKey}`;
}

export function formNameForFieldKey(fieldKey: string) {
  return fieldKeyToFormName[fieldKey] ?? customFieldFormName(fieldKey);
}

export function isCustomLeadField(fieldKey: string) {
  return !fieldKeyToFormName[fieldKey];
}

export function buildLeadDynamicFields(
  configs: AdmissionFormFieldConfig[],
): LeadDynamicField[] {
  return configs
    .filter((field) => field.status === "ACTIVE" && field.is_visible)
    .sort(
      (a, b) =>
        (a.sort_order ?? 0) - (b.sort_order ?? 0) ||
        a.field_label.localeCompare(b.field_label, "vi"),
    )
    .map((field) => ({
      ...field,
      form_name: formNameForFieldKey(field.field_key),
      is_custom: isCustomLeadField(field.field_key),
    }));
}

export function dynamicFieldByFormName(fields: LeadDynamicField[]) {
  return new Map(fields.map((field) => [field.form_name, field]));
}

export async function getAdmissionLeadFormFieldConfigs(
  supabase: SupabaseServerClient,
  segmentId: string,
) {
  const { data, error } = await supabase
    .from("admission_form_field_configs")
    .select(
      "id,segment_id,field_key,field_label,field_group,field_type,is_visible,is_required,option_source,placeholder,help_text,validation_rule,sort_order,status",
    )
    .eq("segment_id", segmentId)
    .eq("status", "ACTIVE")
    .order("sort_order", { ascending: true })
    .returns<AdmissionFormFieldConfig[]>();

  return {
    data: data ?? [],
    error,
  };
}
