export type HeuPilotAccount = {
  id: string;
  displayName: string;
  email: string;
  roleLabel: string;
  scopeLabel: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parsePilotAccounts(value: string | undefined): HeuPilotAccount[] {
  if (!value) return [];

  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item): item is Record<string, unknown> => isRecord(item))
      .map((item) => ({
        id: String(item.id ?? ""),
        displayName: String(item.displayName ?? ""),
        email: String(item.email ?? ""),
        roleLabel: String(item.roleLabel ?? ""),
        scopeLabel: String(item.scopeLabel ?? ""),
      }))
      .filter(
        (item) =>
          item.id &&
          item.displayName &&
          item.email.includes("@") &&
          item.roleLabel &&
          item.scopeLabel,
      )
      .slice(0, 7);
  } catch {
    return [];
  }
}

export function getHeuPilotAccountDirectory(): HeuPilotAccount[] {
  if (
    process.env.NEXT_PUBLIC_HEU_DEPLOYMENT_MODE !== "pilot" ||
    process.env.NEXT_PUBLIC_HEU_ENABLE_PILOT_ACCOUNT_DIRECTORY !== "true"
  ) {
    return [];
  }

  return parsePilotAccounts(
    process.env.NEXT_PUBLIC_HEU_PILOT_ACCOUNT_DIRECTORY_JSON,
  );
}
