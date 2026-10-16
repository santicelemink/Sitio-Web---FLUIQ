import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { BouquetConfig, CartItem, DeliveryInfo, PlacedOrder } from "@/types";
import { BARRIOS, SLOTS_OTHER, SLOTS_TODAY } from "@/data/catalog";
import { sanitizeConfig } from "@/lib/bouquet";
import { calculatePrice } from "@/lib/pricing";
import { safeStorage } from "@/lib/storage";
import { baDateISO, isBeforeCutoff } from "@/lib/time";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  delivery: DeliveryInfo;
  lastOrder: PlacedOrder | null;
  /** Se incrementa cada vez que se agrega un ítem: dispara el "pop" del badge. */
  addPulse: number;
  open: () => void;
  close: () => void;
  setOpen: (open: boolean) => void;
  addItem: (input: { name: string; config: BouquetConfig; productSlug?: string }) => void;
  removeItem: (id: string) => { item: CartItem; index: number } | null;
  restoreItem: (item: CartItem, index: number) => void;
  setDelivery: (partial: Partial<DeliveryInfo>) => void;
  /** Corrige la entrega si quedó desactualizada (pasó el corte, fecha vencida, franja inválida). */
  normalizeDelivery: () => void;
  placeOrder: (order: PlacedOrder) => void;
}

export function slotsFor(day: DeliveryInfo["day"]) {
  return day === "hoy" ? SLOTS_TODAY : SLOTS_OTHER;
}

export function defaultDelivery(): DeliveryInfo {
  const today = isBeforeCutoff();
  return fixDelivery({ day: today ? "hoy" : "manana", date: null, slot: null, barrio: null });
}

export function deliveryDateISO(delivery: DeliveryInfo) {
  if (delivery.day === "hoy") return baDateISO(0);
  if (delivery.day === "manana") return baDateISO(1);
  return delivery.date ?? baDateISO(1);
}

function fixDelivery(d: DeliveryInfo): DeliveryInfo {
  let next = { ...d };
  if (next.day === "hoy" && !isBeforeCutoff()) next = { ...next, day: "manana", slot: null };
  if (next.day === "otra" && next.date && next.date <= baDateISO(0)) next = { ...next, date: null };
  // La franja siempre tiene un valor válido: la primera disponible por defecto.
  if (!next.slot || !slotsFor(next.day).includes(next.slot)) next = { ...next, slot: slotsFor(next.day)[0] };
  if (next.barrio && !BARRIOS.includes(next.barrio)) next = { ...next, barrio: null };
  return next;
}

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      delivery: defaultDelivery(),
      lastOrder: null,
      addPulse: 0,
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      setOpen: (isOpen) => set({ isOpen }),
      addItem: ({ name, config, productSlug }) =>
        set((s) => ({
          items: [
            ...s.items,
            { id: uid(), name, productSlug, config: { ...config }, price: calculatePrice(config), addedAt: Date.now() },
          ],
          addPulse: s.addPulse + 1,
        })),
      removeItem: (id) => {
        const index = get().items.findIndex((i) => i.id === id);
        if (index < 0) return null;
        const item = get().items[index];
        set((s) => ({ items: s.items.filter((i) => i.id !== id) }));
        return { item, index };
      },
      restoreItem: (item, index) =>
        set((s) => {
          const items = [...s.items];
          items.splice(Math.min(index, items.length), 0, item);
          return { items };
        }),
      setDelivery: (partial) => set((s) => ({ delivery: fixDelivery({ ...s.delivery, ...partial }) })),
      normalizeDelivery: () => set((s) => ({ delivery: fixDelivery(s.delivery) })),
      placeOrder: (order) => set({ lastOrder: order, items: [], delivery: { ...defaultDelivery(), barrio: get().delivery.barrio } }),
    }),
    {
      name: "lisboa-pedido",
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      partialize: (s) => ({ items: s.items, delivery: s.delivery, lastOrder: s.lastOrder }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<CartState>;
        const items = Array.isArray(p.items)
          ? p.items.flatMap((raw) => {
              const config = sanitizeConfig(raw?.config);
              if (!config || typeof raw?.id !== "string") return [];
              // El precio se recalcula siempre con la fórmula vigente.
              return [{ ...raw, config, price: calculatePrice(config) } as CartItem];
            })
          : [];
        const delivery = p.delivery && typeof p.delivery === "object" ? fixDelivery({ ...current.delivery, ...p.delivery }) : current.delivery;
        return { ...current, items, delivery, lastOrder: p.lastOrder ?? null };
      },
    },
  ),
);
