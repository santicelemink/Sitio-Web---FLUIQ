import type { BouquetConfig } from "@/types";
import {
  CARD_DESIGNS,
  DEFAULT_CONFIG,
  EXTRAS,
  EXTRA_BY_ID,
  FLOWERS,
  FLOWER_BY_ID,
  FONTS,
  MAX_FLOWERS,
  MESSAGE_MAX,
  OCCASIONS,
  PALETTES,
  PALETTE_BY_ID,
  RIBBONS,
  RIBBON_BY_ID,
  SIZES,
  SIZE_BY_ID,
  WRAPS,
  WRAP_BY_ID,
} from "@/data/catalog";
import { capitalize, joinList, truncate } from "./format";

export function flowersPhrase(config: Pick<BouquetConfig, "flowers">) {
  return joinList(config.flowers.map((id) => FLOWER_BY_ID[id].plural));
}

/** "Ramo clásico de rosas y lisianthus en paleta durazno, con papel seda marfil" */
export function describeBouquet(config: Pick<BouquetConfig, "flowers" | "size" | "palette" | "wrap">) {
  const size = SIZE_BY_ID[config.size].label.toLowerCase();
  const palette = PALETTE_BY_ID[config.palette].label.toLowerCase();
  const wrap = WRAP_BY_ID[config.wrap];
  const container = wrap.kind === "box" ? `en ${wrap.phrase}` : `con ${wrap.phrase}`;
  return `Ramo ${size} de ${flowersPhrase(config)} en paleta ${palette}, ${container}`;
}

/** Líneas de resumen para el carrito y el checkout. */
export function summaryLines(config: BouquetConfig) {
  const size = SIZE_BY_ID[config.size].label;
  const palette = PALETTE_BY_ID[config.palette].label;
  const flowers = capitalize(flowersPhrase(config));
  const wrap = WRAP_BY_ID[config.wrap].label;
  const ribbon = RIBBON_BY_ID[config.ribbon].label.toLowerCase();
  const extras = config.extras.map((id) => EXTRA_BY_ID[id].label);
  let card: string;
  if (config.message.trim()) {
    card = `“${truncate(config.message, 42)}”${config.anonymous ? " · sin firma" : ""}`;
  } else {
    card = config.anonymous ? "Tarjeta sin firma" : "Tarjeta sin mensaje";
  }
  return {
    main: `${size} · ${palette} · ${flowers}`,
    wrap: [`${wrap}, cinta ${ribbon}`, ...extras].join(" · "),
    card,
  };
}

/* ---------- Compartir: el diseño viaja codificado en la URL ---------- */

type Compact = [string, string, string[], string, string, string, string, string, string, 0 | 1, string[]];

function toBase64Url(text: string) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string) {
  const b64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(b64 + "===".slice((b64.length + 3) % 4));
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeConfig(config: BouquetConfig) {
  const compact: Compact = [
    config.occasion,
    config.palette,
    config.flowers,
    config.size,
    config.wrap,
    config.ribbon,
    config.cardDesign,
    config.font,
    config.message,
    config.anonymous ? 1 : 0,
    config.extras,
  ];
  return toBase64Url(JSON.stringify(compact));
}

const ids = <T extends { id: string }>(list: T[]) => new Set(list.map((i) => i.id));
const VALID = {
  occasion: ids(OCCASIONS),
  palette: ids(PALETTES),
  flower: ids(FLOWERS),
  size: ids(SIZES),
  wrap: ids(WRAPS),
  ribbon: ids(RIBBONS),
  card: ids(CARD_DESIGNS),
  font: ids(FONTS),
  extra: ids(EXTRAS),
};

/** Valida cualquier objeto (de la URL o del localStorage) y lo convierte en una configuración segura. */
export function sanitizeConfig(input: unknown): BouquetConfig | null {
  if (!input || typeof input !== "object") return null;
  const c = input as Record<string, unknown>;
  const pick = <K extends keyof typeof VALID>(set: K, value: unknown, fallback: string) =>
    typeof value === "string" && VALID[set].has(value) ? value : fallback;
  const flowers = Array.isArray(c.flowers)
    ? [...new Set(c.flowers.filter((f): f is string => typeof f === "string" && VALID.flower.has(f)))].slice(0, MAX_FLOWERS)
    : [];
  const extras = Array.isArray(c.extras)
    ? [...new Set(c.extras.filter((e): e is string => typeof e === "string" && VALID.extra.has(e)))]
    : [];
  return {
    occasion: pick("occasion", c.occasion, DEFAULT_CONFIG.occasion),
    palette: pick("palette", c.palette, DEFAULT_CONFIG.palette),
    flowers: (flowers.length ? flowers : DEFAULT_CONFIG.flowers) as BouquetConfig["flowers"],
    size: pick("size", c.size, DEFAULT_CONFIG.size),
    wrap: pick("wrap", c.wrap, DEFAULT_CONFIG.wrap),
    ribbon: pick("ribbon", c.ribbon, DEFAULT_CONFIG.ribbon),
    cardDesign: pick("card", c.cardDesign, DEFAULT_CONFIG.cardDesign),
    font: pick("font", c.font, DEFAULT_CONFIG.font),
    message: typeof c.message === "string" ? c.message.slice(0, MESSAGE_MAX) : "",
    anonymous: c.anonymous === true,
    extras: extras as BouquetConfig["extras"],
  } as BouquetConfig;
}

export function decodeConfig(value: string): BouquetConfig | null {
  try {
    const arr = JSON.parse(fromBase64Url(value));
    if (!Array.isArray(arr)) return null;
    const [occasion, palette, flowers, size, wrap, ribbon, cardDesign, font, message, anonymous, extras] = arr;
    return sanitizeConfig({
      occasion,
      palette,
      flowers,
      size,
      wrap,
      ribbon,
      cardDesign,
      font,
      message,
      anonymous: anonymous === 1,
      extras,
    });
  } catch {
    return null;
  }
}

export function configsEqual(a: BouquetConfig, b: BouquetConfig) {
  return JSON.stringify(a) === JSON.stringify(b);
}
