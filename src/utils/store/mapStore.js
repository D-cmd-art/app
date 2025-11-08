// store/mapStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useMapStore = create(
  persist(
    (set, get) => ({
      location: null,
      setLocation: (locationData) => set({ location: locationData }),
      clearLocation: () => set({ location: null }),
      getLocation: () => get().location,
    }),
    {
      name: 'location-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);