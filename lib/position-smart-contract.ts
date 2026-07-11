export const POSITION_SMART_CONTRACT_VERSION = "HEU-SMART-001/v1" as const;

export const POSITION_SMART_OUTPUT_MODES = ["DRAFT", "CHECK", "SUGGEST"] as const;
export type PositionSmartOutputMode = (typeof POSITION_SMART_OUTPUT_MODES)[number];

export const POSITION_SMART_FORBIDDEN_CAPABILITIES = [
  "APPROVE",
  "WRITE",
  "SEND",
  "PAY",
  "DELETE",
  "MIGRATION",
  "PRODUCTION",
] as const;

export type PositionSmartLane = "BGH_READ_ONLY" | "OPERATIONAL";

export type PositionSmartScope = Readonly<{
  accountScopeKey: string;
  positionCode: string;
  departmentCode: string;
  workspaceScope: readonly string[];
  lane: PositionSmartLane;
}>;

export type PositionSmartMetadataInput = Readonly<{
  scope: PositionSmartScope;
  requestId: string;
  requestedMode: PositionSmartOutputMode;
  metadataKeys: readonly string[];
}>;

export type PositionSmartProposalLog = Readonly<{
  contractVersion: typeof POSITION_SMART_CONTRACT_VERSION;
  requestId: string;
  accountScopeKey: string;
  positionCode: string;
  departmentCode: string;
  workspaceScope: readonly string[];
  lane: PositionSmartLane;
  outputMode: PositionSmartOutputMode;
  metadataKeys: readonly string[];
  outcome: "PROPOSAL_ONLY";
  costMode: "ZERO_COST_LOCAL_FIRST";
}>;

export type PositionSmartValidation =
  | Readonly<{ ok: true; scope: PositionSmartScope }>
  | Readonly<{ ok: false; reason: string }>;

const HOU_SCOPE_PREFIX = "HOU";

function hasValue(value: string): boolean {
  return value.trim().length > 0;
}

function hasUniqueNonEmptyValues(values: readonly string[]): boolean {
  const normalized = values.map((value) => value.trim());
  return normalized.length > 0 && normalized.every(hasValue) && new Set(normalized).size === normalized.length;
}

export function validatePositionSmartScope(scope: PositionSmartScope): PositionSmartValidation {
  if (!hasValue(scope.accountScopeKey)) return { ok: false, reason: "MISSING_ACCOUNT_SCOPE_KEY" };
  if (!hasValue(scope.positionCode)) return { ok: false, reason: "MISSING_POSITION_CODE" };
  if (!hasValue(scope.departmentCode)) return { ok: false, reason: "MISSING_DEPARTMENT_CODE" };
  if (!hasUniqueNonEmptyValues(scope.workspaceScope)) return { ok: false, reason: "MISSING_OR_INVALID_WORKSPACE_SCOPE" };

  const hasHouWorkspace = scope.workspaceScope.some((item) => item === HOU_SCOPE_PREFIX || item.startsWith(`${HOU_SCOPE_PREFIX}:`));
  const isHouDepartment = scope.departmentCode === HOU_SCOPE_PREFIX || scope.departmentCode.startsWith(`${HOU_SCOPE_PREFIX}:`);
  if (hasHouWorkspace !== isHouDepartment) return { ok: false, reason: "HOU_SCOPE_MUST_BE_SEPARATED" };

  return {
    ok: true,
    scope: Object.freeze({
      accountScopeKey: scope.accountScopeKey.trim(),
      positionCode: scope.positionCode.trim(),
      departmentCode: scope.departmentCode.trim(),
      workspaceScope: Object.freeze(scope.workspaceScope.map((item) => item.trim())),
      lane: scope.lane,
    }),
  };
}

export function createPositionSmartProposalLog(input: PositionSmartMetadataInput): PositionSmartProposalLog {
  const validation = validatePositionSmartScope(input.scope);
  if (!validation.ok) throw new Error(`POSITION_SMART_FAIL_CLOSED:${validation.reason}`);
  if (!hasValue(input.requestId)) throw new Error("POSITION_SMART_FAIL_CLOSED:MISSING_REQUEST_ID");
  if (!hasUniqueNonEmptyValues(input.metadataKeys)) throw new Error("POSITION_SMART_FAIL_CLOSED:MISSING_OR_INVALID_METADATA_KEYS");

  return Object.freeze({
    contractVersion: POSITION_SMART_CONTRACT_VERSION,
    requestId: input.requestId.trim(),
    accountScopeKey: validation.scope.accountScopeKey,
    positionCode: validation.scope.positionCode,
    departmentCode: validation.scope.departmentCode,
    workspaceScope: validation.scope.workspaceScope,
    lane: validation.scope.lane,
    outputMode: input.requestedMode,
    metadataKeys: Object.freeze(input.metadataKeys.map((key) => key.trim())),
    outcome: "PROPOSAL_ONLY",
    costMode: "ZERO_COST_LOCAL_FIRST",
  });
}

export function scopesAreIndependent(left: PositionSmartScope, right: PositionSmartScope): boolean {
  const leftValidation = validatePositionSmartScope(left);
  const rightValidation = validatePositionSmartScope(right);
  if (!leftValidation.ok || !rightValidation.ok) return false;

  return !(
    leftValidation.scope.accountScopeKey === rightValidation.scope.accountScopeKey &&
    leftValidation.scope.positionCode === rightValidation.scope.positionCode &&
    leftValidation.scope.departmentCode === rightValidation.scope.departmentCode &&
    leftValidation.scope.workspaceScope.length === rightValidation.scope.workspaceScope.length &&
    leftValidation.scope.workspaceScope.every((item, index) => item === rightValidation.scope.workspaceScope[index])
  );
}
