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

  if (segmentId) {
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

  if (ruleRows.length > 0) {
    for (const rule of ruleRows) {
      if (rule.program_id) {
        allowedProgramIds.add(rule.program_id);
      }

      if (rule.major_id) {
        const major = majorById.get(rule.major_id);
        allowedMajorIds.add(rule.major_id);

        if (major?.program_id) {
          allowedProgramIds.add(major.program_id);
        }
      }
    }

    for (const rule of ruleRows) {
      if (rule.program_id && !rule.major_id) {
        for (const major of majorRows) {
          if (major.program_id === rule.program_id) {
            allowedMajorIds.add(major.id);
          }
        }
      }
    }
  } else if (segmentId) {
    for (const programCode of fallbackProgramCodes(segment)) {
      const program = programByCode.get(programCode);

      if (program) {
        allowedProgramIds.add(program.id);
      }
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
  };
}

export function normalizedOptionLabel(value: string | null) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
