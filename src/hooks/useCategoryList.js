import { useQuery } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { requestWithFallback } from "../utils/api";

const SESSION_DURATION = 2 * 60 * 60 * 1000; // 2 hours
const CATEGORY_SESSION_KEY = "category_session";

// -------------------- FETCH CATEGORIES --------------------
const fetchCategories = async () => {
  const res = await requestWithFallback({
    method: 'GET',
    url: '/category',
  });

  console.log("API response for /category:", res?.data); // ✅ debug log

  // Always return an array, never undefined
  return res?.data?.categories ?? [];
};

export function useCategoryList() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const session = await AsyncStorage.getItem(CATEGORY_SESSION_KEY);
      if (session) {
        const { data, timestamp } = JSON.parse(session);
        if (Date.now() - timestamp < SESSION_DURATION) {
          return data ?? [];
        }
      }

      const data = await fetchCategories();

      await AsyncStorage.setItem(
        CATEGORY_SESSION_KEY,
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