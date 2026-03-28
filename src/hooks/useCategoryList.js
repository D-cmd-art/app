// hooks/useCategoryList.js
import { api } from '../utils/api';
import { useQuery } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SESSION_DURATION = 2 * 60 * 60 * 1000; // 2 hours
const CATEGORY_SESSION_KEY = "category_session";

// -------------------- FETCH CATEGORIES --------------------
const fetchCategories = async () => {
  const res = await api.get('/category');
  return res.data.categories;
};

export function useCategoryList() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      // Check cached session
      const session = await AsyncStorage.getItem(CATEGORY_SESSION_KEY);
      if (session) {
        const { data, timestamp } = JSON.parse(session);
        if (Date.now() - timestamp < SESSION_DURATION) {
          return data; // return cached data
        }
      }

      // Fetch fresh data
      const data = await fetchCategories();

      // Save to AsyncStorage
      await AsyncStorage.setItem(
        CATEGORY_SESSION_KEY,
        JSON.stringify({ data, timestamp: Date.now() })
      );

      return data;
    },
    staleTime: SESSION_DURATION,       // session freshness
    cacheTime: SESSION_DURATION,       // keep in memory for 2 hours
    refetchOnWindowFocus: false,       // prevent extra calls
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: false,                      // no automatic retries
  });
}
