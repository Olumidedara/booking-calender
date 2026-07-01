import { create } from "zustand";

interface UIState {
  darkMode: boolean;
  sidebarOpen: boolean;
  toggleDarkMode: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  darkMode: localStorage.getItem("darkMode") === "true",
  sidebarOpen: true,
  toggleDarkMode: () =>
    set((state) => {
      const next = !state.darkMode;
      localStorage.setItem("darkMode", String(next));
      if (next) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return { darkMode: next };
    }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
