export const EXECUTIVE_ROLE_CODES = [
  "ADMIN",
  "BGH",
  "HIEU_TRUONG",
  "PHO_HIEU_TRUONG",
] as const;

export type ExecutiveRoleCode = (typeof EXECUTIVE_ROLE_CODES)[number];

export function isExecutiveRole(
  roleCode: string | null | undefined,
): roleCode is ExecutiveRoleCode {
  return EXECUTIVE_ROLE_CODES.includes(roleCode as ExecutiveRoleCode);
}
