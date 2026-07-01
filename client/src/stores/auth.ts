import { create } from "zustand";
import type { User } from "../types";
import { api } from "../services/api";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: !!localStorage.getItem("token"),

  login: async (email, password) => {
    const res = await api.login(email, password);
    api.setToken(res.token);
    set({ user: res.user, token: res.token, isAuthenticated: true });
  },

  register: async (email, name, password) => {
    const res = await api.register(email, name, password);
    api.setToken(res.token);
    set({ user: res.user, token: res.token, isAuthenticated: true });
  },

  logout: () => {
    api.setToken(null);
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadUser: async () => {
    try {
      const user = await api.getMe();
      set({ user, isAuthenticated: true });
    } catch {
      api.setToken(null);
      set({ user: null, token: null, isAuthenticated: false });
    }
  },
}));
