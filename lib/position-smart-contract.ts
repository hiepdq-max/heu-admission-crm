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
const POSITION_SMART_LANES = ["BGH_READ_ONLY", "OPERATIONAL"] as const;
const RESTRICTED_METADATA_KEY_PARTS = [
  "email",
  "phone",
  "mobile",
  "telephone",
  "cccd",
  "identity",
  "pii",
  "address",
  "bank",
  "account",
  "password",
  "credential",
  "otp",
  "token",
  "secret",
  "lead",
  "student",
  "payment",
  "evidence",
] as const;

function hasValue(value: string): boolean {
  return value.trim().length > 0;
}

function hasUniqueNonEmptyValues(values: readonly string[]): boolean {
  const normalized = values.map((value) => value.trim());
  return (
    normalized.length > 0 &&
    normalized.every(hasValue) &&
    new Set(normalized).size === normalized.length
  );
}

function isHouScope(value: string): boolean {
  const normalized = value.trim().toUpperCase();
  return (
    normalized === HOU_SCOPE_PREFIX ||
    normalized.startsWith(`${HOU_SCOPE_PREFIX}:`)
  );
}

function isAllowedMetadataKey(key: string): boolean {
  const normalizedParts = key
    .trim()
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2")
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

  return !normalizedParts.some((part) =>
    RESTRICTED_METADATA_KEY_PARTS.includes(
      part as (typeof RESTRICTED_METADATA_KEY_PARTS)[number],
    ),
  );
}

export function validatePositionSmartScope(scope: PositionSmartScope): PositionSmartValidation {
  if (!hasValue(scope.accountScopeKey)) return { ok: false, reason: "MISSING_ACCOUNT_SCOPE_KEY" };
  if (!hasValue(scope.positionCode)) return { ok: false, reason: "MISSING_POSITION_CODE" };
  if (!hasValue(scope.departmentCode)) return { ok: false, reason: "MISSING_DEPARTMENT_CODE" };
  if (!hasUniqueNonEmptyValues(scope.workspaceScope)) {
    return { ok: false, reason: "MISSING_OR_INVALID_WORKSPACE_SCOPE" };
  }
  if (!POSITION_SMART_LANES.includes(scope.lane)) {
    return { ok: false, reason: "INVALID_POSITION_LANE" };
  }

  const normalizedWorkspaceScope = scope.workspaceScope.map((item) => item.trim());
  const houWorkspaceCount = normalizedWorkspaceScope.filter(isHouScope).length;
  const isHouDepartment = isHouScope(scope.departmentCode.trim());
  const hasMixedHouWorkspace =
    houWorkspaceCount > 0 && houWorkspaceCount < normalizedWorkspaceScope.length;
  if (hasMixedHouWorkspace || (houWorkspaceCount > 0) !== isHouDepartment) {
    return { ok: false, reason: "HOU_SCOPE_MUST_BE_SEPARATED" };
  }

  return {
    ok: true,
    scope: Object.freeze({
      accountScopeKey: scope.accountScopeKey.trim(),
      positionCode: scope.positionCode.trim(),
      departmentCode: scope.departmentCode.trim(),
      workspaceScope: Object.freeze(normalizedWorkspaceScope),
      lane: scope.lane,
    }),
  };
}

export function createPositionSmartProposalLog(input: PositionSmartMetadataInput): PositionSmartProposalLog {
  const validation = validatePositionSmartScope(input.scope);
  if (!validation.ok) throw new Error(`POSITION_SMART_FAIL_CLOSED:${validation.reason}`);
  if (!hasValue(input.requestId)) throw new Error("POSITION_SMART_FAIL_CLOSED:MISSING_REQUEST_ID");
  if (!POSITION_SMART_OUTPUT_MODES.includes(input.requestedMode)) {
    throw new Error("POSITION_SMART_FAIL_CLOSED:INVALID_OUTPUT_MODE");
  }
  if (!hasUniqueNonEmptyValues(input.metadataKeys)) {
    throw new Error("POSITION_SMART_FAIL_CLOSED:MISSING_OR_INVALID_METADATA_KEYS");
  }
  if (!input.metadataKeys.every(isAllowedMetadataKey)) {
    throw new Error("POSITION_SMART_FAIL_CLOSED:RESTRICTED_METADATA_KEY");
  }

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
    leftValidation.scope.workspaceScope.every(
      (item, index) => item === rightValidation.scope.workspaceScope[index],
    )
  );
}
