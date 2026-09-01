import { create } from "zustand";

export type ViewportLabel = "mobile" | "mobileLarge" | "tablet" | "desktop";

interface StoreState {
  viewportLabel: ViewportLabel | undefined;
  setViewportLabel: (viewportLabel: ViewportLabel) => void;
}

export const useMainStore = create<StoreState>((set) => ({
  viewportLabel: "mobile",
  setViewportLabel: (viewportLabel: ViewportLabel) => {
    set({ viewportLabel });
  },
}));
