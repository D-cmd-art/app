// store.js
import { create } from 'zustand';

export const useUserStore = create((set) => ({
  user: null,
  accessToken: null,
  isLoggedOut: false, // <-- new flag
  refreshAttempts: 0,
  hydrated:false,
  setUser: (user) => set({ user,hydrated:true}),
  setAccessToken: (token) => set({ accessToken: token }),
  setLoggedOut: () => set({ user: null, accessToken: null, isLoggedOut: true }),
  incrementRefreshAttempts: () => set((state) => ({ refreshAttempts: state.refreshAttempts + 1 })),
  resetRefreshAttempts: () => set({ refreshAttempts: 0 }),
  setLoading: (loading) => set({ loading }),
  clear: () => set({ user: null, accessToken: null, loading: false,hydrated:true }),
}));
