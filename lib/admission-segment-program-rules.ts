import type { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export type AdmissionProgramOption = {
  id: string;
  label: string;
  code: string;
};

export type AdmissionMajorOption = {
  id: string;
  label: string;
  code: string;
  programId: string | null;
  programLabel: string | null;
  programCode: string | null;
};

export type AdmissionCatalogControlInfo = {
  catalogGroupCode: string | null;
  allowedProgramCodes: string[];
  allowedMajorPolicy: string | null;
  controlStatus: string | null;
  programCount: number;
  majorCount: number;
  error: string | null;
};

export type AdmissionOfferingCatalogInfo = {
  offeringCount: number;
  needsControlCount: number;
  enrollmentReadyCount: number;
  financeReadyCount: number;
  controlStatuses: string[];
  error: string | null;
};

type SegmentRow = {
  id: string;
  segment_code: string;
  program_group: string | null;
};

type ProgramRow = {
  id: string;
  program_code: string;
  program_name: string;
  sort_order: number | null;
};

type MajorRow = {
  id: string;
  major_code: string;
  major_name: string;
  program_id: string | null;
  sort_order: number | null;
};

type SegmentProgramRuleRow = {
  program_id: string | null;
  major_id: string | null;
  sort_order: number | null;
};

type SegmentCatalogControlRow = {
  catalog_group_code: string | null;
  allowed_program_codes: string[] | null;
  allowed_major_policy: string | null;
  control_status: string | null;
};

type OfferingCatalogRow = {
  control_status: string | null;
  is_enrollment_ready: boolean | null;
  is_finance_ready: boolean | null;
};

function fallbackProgramCodes(segment: SegmentRow | null) {
  const code = segment?.segment_code ?? "";
  const group = segment?.program_group ?? "";

  if (code.startsWith("TC9_") || group.includes("Trung cấp")) {
    return ["TRUNG_CAP"];
  }

  if (code.startsWith("SHORT_") || group.includes("Ngắn hạn")) {
    return ["NGAN_HAN"];
  }

  if (code.startsWith("UNIVERSITY_") || group.includes("Liên thông")) {
    return ["LIEN_THONG_DAI_HOC"];
  }

  return [];
}

function toProgramOption(program: ProgramRow): AdmissionProgramOption {
  return {
    id: program.id,
    label: program.program_name,
    code: program.program_code,
  };
}

function toMajorOption(
  major: MajorRow,
  programById: Map<string, ProgramRow>,
): AdmissionMajorOption {
  const program = major.program_id ? programById.get(major.program_id) : null;

  return {
    id: major.id,
    label: major.major_name,
    code: major.major_code,
    programId: major.program_id,
    programLabel: program?.program_name ?? null,
    programCode: program?.program_code ?? null,
  };
}

function bySortAndLabel<T extends { sort_order: number | null }>(
  getLabel: (item: T) => string,
) {
  return (a: T, b: T) =>
    (a.sort_order ?? 0) - (b.sort_order ?? 0) ||
    getLabel(a).localeCompare(getLabel(b), "vi");
}

export async function getAllowedProgramMajorOptions(
  supabase: SupabaseServerClient,
  segmentId: string | null,
) {
  const [{ data: segment }, { data: programs }, { data: majors }] =
    await Promise.all([
      segmentId
        ? supabase
            .from("admission_segments")
            .select("id,segment_code,program_group")
            .eq("id", segmentId)
            .maybeSingle<SegmentRow>()
        : Promise.resolve({ data: null }),
      supabase
        .from("admission_programs")
        .select("id,program_code,program_name,sort_order")
        .eq("status", "ACTIVE")
        .order("sort_order", { ascending: true })
        .returns<ProgramRow[]>(),
      supabase
        .from("admission_majors")
        .select("id,major_code,major_name,program_id,sort_order")
        .eq("status", "ACTIVE")
        .order("sort_order", { ascending: true })
        .returns<MajorRow[]>(),
    ]);

  const programRows = programs ?? [];
  const majorRows = majors ?? [];
  const programById = new Map(programRows.map((program) => [program.id, program]));
  const programByCode = new Map(
    programRows.map((program) => [program.program_code, program]),
  );
  const majorById = new Map(majorRows.map((major) => [major.id, major]));

  let ruleRows: SegmentProgramRuleRow[] = [];
  let catalogControl: SegmentCatalogControlRow | null = null;
  let catalogControlError: string | null = null;
  let offeringRows: OfferingCatalogRow[] = [];
  let offeringCatalogError: string | null = null;

  if (segmentId) {
    const { data: control, error: controlError } = await supabase
      .from("admission_segment_catalog_controls")
      .select(
        "catalog_group_code,allowed_program_codes,allowed_major_policy,control_status",
      )
      .eq("segment_id", segmentId)
      .eq("status", "ACTIVE")
      .maybeSingle<SegmentCatalogControlRow>();

    if (controlError) {
      catalogControlError = controlError.message;
    } else {
      catalogControl = control;
    }

    if (segment?.segment_code) {
      const { data: offerings, error: offeringsError } = await supabase
        .from("admission_offering_catalog")
        .select("control_status,is_enrollment_ready,is_finance_ready")
        .contains("allowed_segment_codes", [segment.segment_code])
        .eq("status", "ACTIVE")
        .returns<OfferingCatalogRow[]>();

      if (offeringsError) {
        offeringCatalogError = offeringsError.message;
      } else {
        offeringRows = offerings ?? [];
      }
    }

    const { data: rules, error: rulesError } = await supabase
      .from("admission_segment_program_rules")
      .select("program_id,major_id,sort_order")
      .eq("segment_id", segmentId)
      .eq("status", "ACTIVE")
      .order("sort_order", { ascending: true })
      .returns<SegmentProgramRuleRow[]>();

    if (!rulesError) {
      ruleRows = rules ?? [];
    }
  }

  const allowedProgramIds = new Set<string>();
  const allowedMajorIds = new Set<string>();
  const configuredProgramCodes = new Set(
    (catalogControl?.allowed_program_codes ?? []).filter(Boolean),
  );
  const isProgramAllowedByCatalog = (programId: string | null) => {
    if (!programId || configuredProgramCodes.size === 0) {
      return true;
    }

    const program = programById.get(programId);

    return program ? configuredProgramCodes.has(program.program_code) : false;
  };
  const addProgramByCode = (programCode: string) => {
    const program = programByCode.get(programCode);

    if (program) {
      allowedProgramIds.add(program.id);
    }
  };

  if (ruleRows.length > 0) {
    for (const rule of ruleRows) {
      if (rule.program_id && isProgramAllowedByCatalog(rule.program_id)) {
        allowedProgramIds.add(rule.program_id);
      }

      if (rule.major_id) {
        const major = majorById.get(rule.major_id);

        if (major && isProgramAllowedByCatalog(major.program_id)) {
          allowedMajorIds.add(rule.major_id);
        }

        if (major?.program_id && isProgramAllowedByCatalog(major.program_id)) {
          allowedProgramIds.add(major.program_id);
        }
      }
    }

    for (const rule of ruleRows) {
      if (
        rule.program_id &&
        !rule.major_id &&
        isProgramAllowedByCatalog(rule.program_id)
      ) {
        for (const major of majorRows) {
          if (major.program_id === rule.program_id) {
            allowedMajorIds.add(major.id);
          }
        }
      }
    }
  } else if (segmentId) {
    const programCodes =
      configuredProgramCodes.size > 0
        ? [...configuredProgramCodes]
        : fallbackProgramCodes(segment);

    for (const programCode of programCodes) {
      addProgramByCode(programCode);
    }

    for (const major of majorRows) {
      if (major.program_id && allowedProgramIds.has(major.program_id)) {
        allowedMajorIds.add(major.id);
      }
    }
  } else {
    for (const program of programRows) {
      allowedProgramIds.add(program.id);
    }

    for (const major of majorRows) {
      allowedMajorIds.add(major.id);
    }
  }

  if (configuredProgramCodes.size > 0) {
    for (const programId of [...allowedProgramIds]) {
      if (!isProgramAllowedByCatalog(programId)) {
        allowedProgramIds.delete(programId);
      }
    }

    for (const majorId of [...allowedMajorIds]) {
      const major = majorById.get(majorId);

      if (!major || !isProgramAllowedByCatalog(major.program_id)) {
        allowedMajorIds.delete(majorId);
      }
    }
  }

  const allowedPrograms = programRows
    .filter((program) => allowedProgramIds.has(program.id))
    .sort(bySortAndLabel((program) => program.program_name))
    .map(toProgramOption);
  const allowedMajors = majorRows
    .filter((major) => allowedMajorIds.has(major.id))
    .sort(bySortAndLabel((major) => major.major_name))
    .map((major) => toMajorOption(major, programById));

  return {
    programs: allowedPrograms,
    majors: allowedMajors,
    catalogControl: segmentId
      ? {
          catalogGroupCode: catalogControl?.catalog_group_code ?? null,
          allowedProgramCodes: [...configuredProgramCodes],
          allowedMajorPolicy: catalogControl?.allowed_major_policy ?? null,
          controlStatus: catalogControl?.control_status ?? null,
          programCount: allowedPrograms.length,
          majorCount: allowedMajors.length,
          error: catalogControlError,
        }
      : null,
    offeringCatalog: segmentId
      ? {
          offeringCount: offeringRows.length,
          needsControlCount: offeringRows.filter((offering) =>
            ["CAN_SUA", "CHUA_DU_DIEU_KIEN"].includes(
              offering.control_status ?? "",
            ),
          ).length,
          enrollmentReadyCount: offeringRows.filter(
            (offering) => offering.is_enrollment_ready === true,
          ).length,
          financeReadyCount: offeringRows.filter(
            (offering) => offering.is_finance_ready === true,
          ).length,
          controlStatuses: [
            ...new Set(
              offeringRows
                .map((offering) => offering.control_status)
                .filter((value): value is string => Boolean(value)),
            ),
          ],
          error: offeringCatalogError,
        }
      : null,
  };
}

export function normalizedOptionLabel(value: string | null) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
