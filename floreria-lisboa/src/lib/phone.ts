/**
 * Valida un teléfono argentino. Acepta, entre otros:
 * 11 2345 6789 · 011 15 2345-6789 · +54 9 11 2345 6789 · 351 234 5678
 */
export function normalizeArgentinePhone(raw: string): string | null {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("54")) digits = digits.slice(2);
  if (digits.startsWith("9") && digits.length === 11) digits = digits.slice(1);
  if (digits.startsWith("0")) digits = digits.slice(1);
  if (digits.length === 10) return digits;
  if (digits.length === 12) {
    // Formato local con "15" después del código de área (2 a 4 dígitos)
    for (const areaLength of [2, 3, 4]) {
      if (digits.slice(areaLength, areaLength + 2) === "15") {
        const candidate = digits.slice(0, areaLength) + digits.slice(areaLength + 2);
        if (candidate.length === 10) return candidate;
      }
    }
  }
  return null;
}

export function isValidArgentinePhone(raw: string) {
  return normalizeArgentinePhone(raw) !== null;
}
