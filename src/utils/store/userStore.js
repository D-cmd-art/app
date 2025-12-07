import { create } from 'zustand';

export const useUserStore = create((set) => ({
  user: null,
  accessToken: null,
  isLoggedOut: false,
  refreshAttempts: 0,
  hydrated: false,
  loading: false,

  setUser: (userData) => {
    if (!userData) {
      // ✅ handle null/undefined safely
      set({ user: null, hydrated: true });
      return;
    }
    set({
      user: {
        id: userData._id || userData.id || null,
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
      },
      hydrated: true,
    });
  },

  setAccessToken: (token) => set({ accessToken: token }),
  setLoggedOut: () => set({ user: null, accessToken: null, isLoggedOut: true }),
  incrementRefreshAttempts: () =>
    set((state) => ({ refreshAttempts: state.refreshAttempts + 1 })),
  resetRefreshAttempts: () => set({ refreshAttempts: 0 }),
  setLoading: (loading) => set({ loading }),
  clear: () =>
    set({ user: null, accessToken: null, loading: false, hydrated: true }),
}));
