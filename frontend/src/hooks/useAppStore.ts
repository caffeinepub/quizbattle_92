import { create } from "zustand";

interface AppState {
  isMuted: boolean;
  setMuted: (muted: boolean) => void;
}

export const useAppStore = create<AppState>()((set) => ({
  isMuted: false,
  setMuted: (muted) => set({ isMuted: muted }),
}));
