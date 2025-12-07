// /hooks/useFreeDelivery.js

import { api } from '../utils/api';
import { useQuery } from "@tanstack/react-query";

export function useFreeDelivery(userId, options = {}) {
  return useQuery({
    queryKey: ["free-delivery", userId],
    queryFn: async () => {
      // Return 0 immediately if no user is logged in
      if (!userId) return 0; 
      try {
        const res = await api.get("/auth/user/freeDelivery", {
          params: { userId },
        });

        // CRITICAL FIX: Ensure the value is a number and defaults to 0 if null/undefined.
        const remainingDeliveries = Number(res.data.freeDelivery) || 0;
        
        return remainingDeliveries;

      } catch (error) {
        // Log the error and safely default to 0 on API failure
        console.error("Failed to fetch free delivery count:", error);
        return 0; 
      }
    },
    enabled: !!userId, 
    ...options,
  });
}