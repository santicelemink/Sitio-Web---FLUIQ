import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { BouquetConfig, ExtraId, FlowerId, OccasionId } from "@/types";
import {
  DEFAULT_CONFIG,
  FLOWERS,
  HARMONY,
  MAX_FLOWERS,
  OCCASION_BY_ID,
  PALETTES,
  SIZES,
} from "@/data/catalog";
import { configsEqual, sanitizeConfig } from "@/lib/bouquet";
import { safeStorage } from "@/lib/storage";

export const STEP_COUNT = 6;

export type FlowerToggleResult = "ok" | "max" | "min";

interface ConfiguratorState {
  config: BouquetConfig;
  step: number;
  /** Slug del diseño de la casa que se está personalizando, si corresponde. */
  baseProduct: string | null;
  savedDesign: BouquetConfig | null;
  setStep: (step: number) => void;
  next: () => void;
  prev: () => void;
  update: (partial: Partial<BouquetConfig>) => void;
  setOccasion: (id: OccasionId) => void;
  toggleFlower: (id: FlowerId) => FlowerToggleResult;
  toggleExtra: (id: ExtraId) => void;
  loadConfig: (config: BouquetConfig, options?: { step?: number; baseProduct?: string | null }) => void;
  surprise: () => void;
  reset: () => void;
  saveDesign: () => void;
}

const pick = <T,>(list: readonly T[]) => list[Math.floor(Math.random() * list.length)];

function shuffle<T>(list: T[]) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Una combinación aleatoria pero armónica: paleta, flores, papel y cinta que conviven bien. */
function randomHarmonious(current: BouquetConfig): BouquetConfig {
  for (let attempt = 0; attempt < 8; attempt++) {
    const palette = pick(PALETTES).id;
    const count = Math.random() < 0.65 ? 2 : 3;
    const flowers = shuffle(FLOWERS.map((f) => f.id)).slice(0, count);
    const roll = Math.random();
    const size = roll < 0.6 ? "clasico" : roll < 0.8 ? "abundante" : "petite";
    const harmony = HARMONY[palette];
    const next: BouquetConfig = {
      ...current,
      palette,
      flowers,
      size: SIZES.find((s) => s.id === size)!.id,
      wrap: pick(harmony.wraps),
      ribbon: pick(harmony.ribbons),
      cardDesign: Math.random() < 0.3 ? "acuarela" : current.cardDesign,
    };
    if (!configsEqual(next, current)) return next;
  }
  return current;
}

export const useConfigurator = create<ConfiguratorState>()(
  persist(
    (set, get) => ({
      config: DEFAULT_CONFIG,
      step: 0,
      baseProduct: null,
      savedDesign: null,
      setStep: (step) => set({ step: Math.max(0, Math.min(STEP_COUNT - 1, step)) }),
      next: () => set((s) => ({ step: Math.min(STEP_COUNT - 1, s.step + 1) })),
      prev: () => set((s) => ({ step: Math.max(0, s.step - 1) })),
      update: (partial) => set((s) => ({ config: { ...s.config, ...partial } })),
      setOccasion: (id) =>
        set((s) => ({ config: { ...s.config, occasion: id, palette: OCCASION_BY_ID[id].palette } })),
      toggleFlower: (id) => {
        const { flowers } = get().config;
        if (flowers.includes(id)) {
          if (flowers.length === 1) return "min";
          set((s) => ({ config: { ...s.config, flowers: flowers.filter((f) => f !== id) } }));
          return "ok";
        }
        if (flowers.length >= MAX_FLOWERS) return "max";
        set((s) => ({ config: { ...s.config, flowers: [...flowers, id] } }));
        return "ok";
      },
      toggleExtra: (id) =>
        set((s) => {
          const extras = s.config.extras.includes(id)
            ? s.config.extras.filter((e) => e !== id)
            : [...s.config.extras, id];
          return { config: { ...s.config, extras } };
        }),
      loadConfig: (config, options) =>
        set({
          config: { ...config },
          step: options?.step ?? 0,
          baseProduct: options?.baseProduct ?? null,
        }),
      surprise: () => set((s) => ({ config: randomHarmonious(s.config), baseProduct: null })),
      reset: () => set({ config: DEFAULT_CONFIG, step: 0, baseProduct: null }),
      saveDesign: () => set((s) => ({ savedDesign: { ...s.config } })),
    }),
    {
      name: "lisboa-diseno",
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({ savedDesign: state.savedDesign }),
      merge: (persisted, current) => {
        const saved = sanitizeConfig((persisted as { savedDesign?: unknown } | undefined)?.savedDesign);
        return saved ? { ...current, savedDesign: saved, config: saved } : current;
      },
    },
  ),
);
