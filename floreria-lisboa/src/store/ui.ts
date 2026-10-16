import { create } from "zustand";

interface UIState {
  /** Hay una barra fija abajo (navegación del configurador en mobile): los botones flotantes se apartan. */
  bottomBar: boolean;
  setBottomBar: (value: boolean) => void;
}

export const useUI = create<UIState>()((set) => ({
  bottomBar: false,
  setBottomBar: (bottomBar) => set({ bottomBar }),
}));
