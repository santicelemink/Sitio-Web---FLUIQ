import type { BouquetConfig } from "@/types";
import {
  CARD_BY_ID,
  EXTRA_BY_ID,
  FLOWER_BY_ID,
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_COST,
  SIZE_BY_ID,
  WRAP_BY_ID,
} from "@/data/catalog";
import { roundToHundred } from "./format";

/**
 * precio = baseTamaño
 *        + (promedio del recargo de las flores) × (tallos / 11) × 1.4
 *        + envoltorio + tarjeta + extras
 * redondeado a la centena.
 */
export function calculatePrice(config: BouquetConfig) {
  const size = SIZE_BY_ID[config.size];
  const surcharges = config.flowers.map((id) => FLOWER_BY_ID[id].surcharge);
  const avg = surcharges.length ? surcharges.reduce((a, b) => a + b, 0) / surcharges.length : 0;
  const flowers = avg * (size.stems / 11) * 1.4;
  const wrap = WRAP_BY_ID[config.wrap].surcharge;
  const card = CARD_BY_ID[config.cardDesign].surcharge;
  const extras = config.extras.reduce((sum, id) => sum + EXTRA_BY_ID[id].price, 0);
  return roundToHundred(size.base + flowers + wrap + card + extras);
}

export function shippingFor(subtotal: number) {
  if (subtotal === 0) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
}

export function cartTotals(prices: number[]) {
  const subtotal = prices.reduce((a, b) => a + b, 0);
  const shipping = shippingFor(subtotal);
  return {
    subtotal,
    shipping,
    total: subtotal + shipping,
    missingForFree: Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal),
    progress: Math.min(1, subtotal / FREE_SHIPPING_THRESHOLD),
  };
}
