// hooks/useCarouselList.js
import { useQuery } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { requestWithFallback } from "../utils/api";

const SESSION_DURATION = 2 * 60 * 60 * 1000; // 2 hours
const CAROUSEL_SESSION_KEY = "carousel_session";

// -------------------- FETCH CAROUSEL --------------------
const fetchCarousel = async () => {
  const res = await requestWithFallback({
    method: 'GET',
    url: '/carousel',
  });

  console.log("API response for /carousel:", res?.data); // debug log

  // ✅ Always return an array, never undefined
  return res?.data?.carouselList ?? [];
};

export function useCarouselList() {
  return useQuery({
    queryKey: ["carousel"],
    queryFn: async () => {
      const session = await AsyncStorage.getItem(CAROUSEL_SESSION_KEY);
      if (session) {
        const { data, timestamp } = JSON.parse(session);
        if (Date.now() - timestamp < SESSION_DURATION) {
          return data ?? []; // ensure defined
        }
      }

      const data = await fetchCarousel();

      await AsyncStorage.setItem(
        CAROUSEL_SESSION_KEY,
        JSON.stringify({ data, timestamp: Date.now() })
      );

      return data ?? []; // ensure defined
    },
    staleTime: SESSION_DURATION,
    cacheTime: SESSION_DURATION,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: false,
  });
}