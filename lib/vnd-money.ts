export function parsePositiveVndAmountInput(
  value: string | null | undefined,
) {
  const rawValue = String(value ?? "")
    .replace(/\u00a0/g, " ")
    .trim();

  if (!rawValue) {
    return null;
  }

  const amountText = rawValue
    .replace(/\s*(?:vnd|vn\u0111|\u0111|\u20ab)\s*$/iu, "")
    .trim()
    .replace(/\s+/g, " ");

  const hasGroupedSeparators = /[., ]/.test(amountText);
  const validAmount = hasGroupedSeparators
    ? /^\d{1,3}(?:[., ]\d{3})+$/.test(amountText)
    : /^\d+$/.test(amountText);

  if (!validAmount) {
    return null;
  }

  const normalizedAmount = amountText.replace(/[., ]/g, "");
  const numericAmount = Number(normalizedAmount);

  return Number.isSafeInteger(numericAmount) && numericAmount > 0
    ? numericAmount
    : null;
}

function numericVndValue(value: number | string | null | undefined) {
  const numericValue = Number(value ?? 0);

  return Number.isFinite(numericValue) ? Math.round(numericValue) : 0;
}

export function formatVndInput(value: number | string | null | undefined) {
  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0,
  }).format(numericVndValue(value));
}

export function formatVndAmount(value: number | string | null | undefined) {
  return `${formatVndInput(value)} \u0111`;
}
