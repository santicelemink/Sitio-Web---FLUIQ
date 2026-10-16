import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { safeStorage } from "@/lib/storage";

interface PresentationState {
  active: boolean;
  setActive: (active: boolean) => void;
  toggle: () => void;
}

export const usePresentation = create<PresentationState>()(
  persist(
    (set) => ({
      active: false,
      setActive: (active) => set({ active }),
      toggle: () => set((s) => ({ active: !s.active })),
    }),
    {
      name: "lisboa-presentacion",
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      partialize: (s) => ({ active: s.active }),
    },
  ),
);
