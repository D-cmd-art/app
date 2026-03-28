// hooks/useCarouselList.js
import { useQuery } from "@tanstack/react-query";
import { api } from "../utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SESSION_DURATION = 2 * 60 * 60 * 1000; // 2 hours
const CAROUSEL_SESSION_KEY = "carousel_session";

// -------------------- FETCH CAROUSEL --------------------
const fetchCarousel = async () => {
  const res = await api.get("/carousel");
  return res.data.carouselList;
};

export function useCarouselList() {
  return useQuery({
    queryKey: ["carousel"],
    queryFn: async () => {
      // Check if session exists
      const session = await AsyncStorage.getItem(CAROUSEL_SESSION_KEY);
      if (session) {
        const { data, timestamp } = JSON.parse(session);
        if (Date.now() - timestamp < SESSION_DURATION) {
          return data; // Return cached data
        }
      }

      // Fetch fresh data
      const data = await fetchCarousel();

      // Save to AsyncStorage
      await AsyncStorage.setItem(
        CAROUSEL_SESSION_KEY,
        JSON.stringify({ data, timestamp: Date.now() })
      );

      return data;
    },
    staleTime: SESSION_DURATION,      // session freshness
    cacheTime: SESSION_DURATION,      // keep in memory for 2 hours
    refetchOnWindowFocus: false,      // prevent extra calls
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: false,
  });
}
