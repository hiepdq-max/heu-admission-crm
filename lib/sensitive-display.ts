function normalizeSensitiveValue(value: string | number | null | undefined) {
  const normalized = String(value ?? "").trim();
  return normalized.length > 0 ? normalized : null;
}

function visibleTail(value: string, visible = 4) {
  return value.slice(Math.max(0, value.length - visible));
}

export function maskSensitiveReference(
  value: string | number | null | undefined,
  visible = 4,
) {
  const normalized = normalizeSensitiveValue(value);

  if (!normalized) {
    return null;
  }

  return `***${visibleTail(normalized, visible)}`;
}

export function maskPhone(value: string | null | undefined) {
  return maskSensitiveReference(value, 3);
}

export function maskIdentityNo(value: string | null | undefined) {
  return maskSensitiveReference(value, 4);
}

export function maskVoucherOrRawId(value: string | null | undefined) {
  return maskSensitiveReference(value, 4);
}
