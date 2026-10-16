const priceFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** Redondea a la centena más cercana. */
export function roundToHundred(value: number) {
  return Math.round(value / 100) * 100;
}

/** Formato de pesos argentinos sin decimales: $39.000 */
export function formatPrice(value: number) {
  // Intl agrega un espacio duro entre "$" y el número; lo quitamos para que quede "$39.000".
  return priceFormatter.format(roundToHundred(value)).replace(/\s/g, "");
}

/** Une una lista en español: "rosas, peonías y lisianthus" (usa "e" antes de "i" o "hi"). */
export function joinList(items: string[]) {
  if (items.length <= 1) return items[0] ?? "";
  const last = items[items.length - 1];
  const conj = /^h?i(?![aeiouáéó])/i.test(last) ? "e" : "y";
  return `${items.slice(0, -1).join(", ")} ${conj} ${last}`;
}

export function truncate(text: string, max: number) {
  const clean = text.trim().replace(/\s+/g, " ");
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}

export function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
