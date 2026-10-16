/** Toda la lógica de horarios usa la hora de Buenos Aires, sin importar dónde esté el navegador. */
export const TIME_ZONE = "America/Argentina/Buenos_Aires";
export const CUTOFF_HOUR = 14;

const partsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

export interface BAParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

export function getBAParts(date: Date = new Date()): BAParts {
  const parts = Object.fromEntries(
    partsFormatter.formatToParts(date).map((p) => [p.type, p.value]),
  ) as Record<string, string>;
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour) % 24,
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
}

/** Segundos que faltan para el corte de las 14 h en Buenos Aires (0 si ya pasó). */
export function secondsUntilCutoff(date: Date = new Date()) {
  const p = getBAParts(date);
  const elapsed = p.hour * 3600 + p.minute * 60 + p.second;
  return Math.max(0, CUTOFF_HOUR * 3600 - elapsed);
}

export function isBeforeCutoff(date: Date = new Date()) {
  return secondsUntilCutoff(date) > 0;
}

export function formatCountdown(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${h}h ${pad(m)}m ${pad(s)}s`;
}

/** Fecha ISO (YYYY-MM-DD) de Buenos Aires, con un desplazamiento opcional en días. */
export function baDateISO(offsetDays = 0, date: Date = new Date()) {
  const p = getBAParts(date);
  const d = new Date(Date.UTC(p.year, p.month - 1, p.day + offsetDays, 12));
  return d.toISOString().slice(0, 10);
}

export function isoToLocalDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function localDateToISO(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

const longDate = new Intl.DateTimeFormat("es-AR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});
const shortDate = new Intl.DateTimeFormat("es-AR", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

function isoToUTC(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12));
}

/** "sábado 18 de octubre" */
export function formatLongDate(iso: string) {
  return longDate.format(isoToUTC(iso));
}

/** "sáb 18 oct" */
export function formatShortDate(iso: string) {
  return shortDate.format(isoToUTC(iso)).replace(/\./g, "").replace(",", "");
}
