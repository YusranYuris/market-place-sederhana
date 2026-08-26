import { create } from "zustand";

import * as authService from "../services/authService.js";
import { TOKEN_KEY } from "../services/api.js";
import { useCartStore } from "./cartStore.js";

const USER_KEY = "marketplace_user";

// Baca sesi yang tersimpan supaya login bertahan saat refresh
const readStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);

    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create((set, get) => ({
  user: readStoredUser(),
  token: localStorage.getItem(TOKEN_KEY),
  loading: false,

  isLoggedIn: () => Boolean(get().token && get().user),

  isPembeli: () => get().user?.role === "pembeli",

  isPenjual: () => get().user?.role === "penjual",

  // Simpan sesi hasil login
  setSession: ({ token, user }) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    set({ token, user });
  },

  login: async (credentials) => {
    set({ loading: true });

    try {
      const result = await authService.login(credentials);

      get().setSession(result);

      return result.user;
    } finally {
      set({ loading: false });
    }
  },

  register: async (payload) => {
    set({ loading: true });

    try {
      return await authService.register(payload);
    } finally {
      set({ loading: false });
    }
  },

  // Sinkronkan data user terbaru dari server
  refreshProfile: async () => {
    const user = await authService.getProfile();

    localStorage.setItem(USER_KEY, JSON.stringify(user));

    set({ user });

    return user;
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    useCartStore.getState().clear();

    set({ token: null, user: null });
  },
}));
