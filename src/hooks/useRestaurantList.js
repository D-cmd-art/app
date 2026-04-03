import { useQuery } from "@tanstack/react-query";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { requestWithFallback } from "../utils/api"; // ✅ use fallback-aware helper

const SESSION_DURATION = 2 * 60 * 60 * 1000; // 2 hours
const RESTAURANT_SESSION_KEY = 'restaurant_session';
const PRODUCTS_SESSION_KEY_PREFIX = 'restaurant_products_';

// -------------------- FETCH RESTAURANTS --------------------
const fetchRestaurants = async () => {
  const res = await requestWithFallback({
    method: 'GET',
    url: '/restaurant',
  });

  console.log("API response for /restaurant:", res?.data); // debug log

  // ✅ Always return an array, never undefined
  return res?.data?.restaurant ?? [];
};

export function useRestaurantList() {
  return useQuery({
    queryKey: ["restaurant"],
    queryFn: async () => {
      const session = await AsyncStorage.getItem(RESTAURANT_SESSION_KEY);
      if (session) {
        const { data, timestamp } = JSON.parse(session);
        if (Date.now() - timestamp < SESSION_DURATION) {
          return data ?? [];
        }
      }

      const data = await fetchRestaurants();

      await AsyncStorage.setItem(
        RESTAURANT_SESSION_KEY,
        JSON.stringify({ data, timestamp: Date.now() })
      );

      return data ?? [];
    },
    staleTime: SESSION_DURATION,
    cacheTime: SESSION_DURATION,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: false,
  });
}

// -------------------- FETCH RESTAURANT PRODUCTS --------------------
const fetchRestaurantProduct = async (restaurantId) => {
  const res = await requestWithFallback({
    method: 'GET',
    url: `/restaurant/${restaurantId}`,
  });

  console.log(`API response for /restaurant/${restaurantId}:`, res?.data);

  // ✅ Always return an object, never undefined
  return res?.data ?? {};
};

export function useRestaurantProducts(id) {
  return useQuery({
    queryKey: ["restaurantProducts", id],
    queryFn: async () => {
      const sessionKey = `${PRODUCTS_SESSION_KEY_PREFIX}${id}`;
      const session = await AsyncStorage.getItem(sessionKey);

      if (session) {
        const { data, timestamp } = JSON.parse(session);
        if (Date.now() - timestamp < SESSION_DURATION) {
          return data ?? {};
        }
      }

      const data = await fetchRestaurantProduct(id);

      await AsyncStorage.setItem(
        sessionKey,
        JSON.stringify({ data, timestamp: Date.now() })
      );

      return data ?? {};
    },
    enabled: !!id,
    staleTime: SESSION_DURATION,
    cacheTime: SESSION_DURATION,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: false,
  });
}