// store/mapStore.js
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useMapStore = create(
  persist(
    (set, get) => ({
      // Existing state
      location: null,
      
      // ✅ NEW STATE ADDED: distance (in km)
      distance: null, // Stores the calculated distance between user and restaurant (in km)

      // Existing action
      setLocation: (locationData) => {
        const normalized = {
          lat:
            locationData.lat ??
            locationData.latitude ??
            null,
          lng:
            locationData.lng ??
            locationData.longitude ??
            null,
          address: locationData.address ?? null,
          timestamp: locationData.timestamp ?? new Date().toISOString(),
        };
        set({ location: normalized });
      },

      // ✅ NEW ACTION ADDED: setDistance
      setDistance: (dist) => {
        // Ensure distance is either a number or null
        const value = typeof dist === 'number' && !isNaN(dist) ? dist : null;
        set({ distance: value });
      },

      clearLocation: () => set({ location: null, distance: null }), // Also clear distance
      getLocation: () => get().location,
    }),
    {
      name: "location-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);