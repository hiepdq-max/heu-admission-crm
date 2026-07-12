const PILOT_NON_CORE_BLOCKED_ROLES = new Set([
  "PILOT_ADMISSION_HEAD",
  "PILOT_COUNSELOR",
  "PILOT_ACCOUNTING_LEAD_READONLY",
  "PILOT_ACCOUNTING_READONLY",
]);

export function isPilotBlockedFromNonCoreRoute(roleCode: string | null) {
  return roleCode ? PILOT_NON_CORE_BLOCKED_ROLES.has(roleCode) : false;
}
